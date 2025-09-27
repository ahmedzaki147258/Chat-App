import { Op } from "sequelize";
import { Server, Socket } from "socket.io";
import { Conversation, Message, User } from "src/db";
import { addUserSocket, removeUserSocket, getUserSocket } from "./socketUserMap";
import { 
  SendMessagePayload, 
  EditMessagePayload, 
  DeleteMessagePayload, 
  MarkMessageReadPayload,
  TypingPayload 
} from "@/shared/types/message";

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000;
// User is considered offline after 2 missed heartbeats
const OFFLINE_THRESHOLD = HEARTBEAT_INTERVAL * 2;

// Track typing timeouts
const typingTimeouts: Record<string, NodeJS.Timeout> = {};

export default function chatSocket(io: Server, socket: Socket) {
  console.log(`Socket connected: ${socket.id}, User: ${socket.user?.id}`);
  
  if (!socket.user?.id) return;

  const userId = socket.user.id;
  
  // Register user socket and update online status
  addUserSocket(userId, socket.id);
  updateUserOnlineStatus(userId, true);
  
  // Setup heartbeat
  setupHeartbeat(socket, userId);

  // ==================== MESSAGE EVENTS ====================
  
  // Send new message
  socket.on("sendMessage", async (payload: SendMessagePayload) => {
    try {
      const { content, messageType, receiverId, replyToMessageId } = payload;
      
      // Find or create conversation
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { userOneId: userId, userTwoId: receiverId },
            { userOneId: receiverId, userTwoId: userId }
          ]
        }
      });

      const isNewConversation = !conversation;

      if (!conversation) {
        conversation = await Conversation.create({
          userOneId: userId,
          userTwoId: receiverId
        });
      }

      // Create message
      const message = await Message.create({
        content,
        messageType,
        conversationId: conversation.id,
        senderId: userId,
        replyToMessageId: replyToMessageId || null,
      });

      // Load message with relationships
      const fullMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: "sender",
            attributes: ['id', 'name', 'email', 'imageUrl', 'isOnline', 'lastSeen']
          },
          {
            model: Message,
            as: "replyToMessage",
            include: [{
              model: User,
              as: "sender",
              attributes: ['id', 'name', 'email', 'imageUrl']
            }]
          }
        ]
      });

      // Update conversation tracking
      await conversation.updateLastMessageTime();
      await conversation.incrementUnreadCount(receiverId);

      // Mark as delivered if receiver is online
      const receiverSocket = getUserSocket(receiverId);
      if (receiverSocket) {
        await message.markAsDelivered();
      }

      // Emit to receiver
      if (receiverSocket) {
        io.to(receiverSocket).emit("newMessage", fullMessage);

        // Also emit newConversation if this is the first message in a new conversation
        if (isNewConversation) {
          const fullConversation = await Conversation.findByPk(conversation.id, {
            include: [
              {
                model: User,
                as: "userOne",
                attributes: ['id', 'name', 'email', 'imageUrl', 'isOnline', 'lastSeen']
              },
              {
                model: User,
                as: "userTwo",
                attributes: ['id', 'name', 'email', 'imageUrl', 'isOnline', 'lastSeen']
              }
            ]
          });
          io.to(receiverSocket).emit("newConversation", fullConversation);
        }
      }

      // Emit back to sender for confirmation
      socket.emit("messageSent", fullMessage);

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Edit message
  socket.on("editMessage", async (payload: EditMessagePayload) => {
    try {
      const { messageId, content, conversationId } = payload;
      
      const message = await Message.findByPk(messageId);
      if (!message || message.senderId !== userId) {
        socket.emit("messageError", { error: "Unauthorized or message not found" });
        return;
      }

      if (!message.canBeEdited()) {
        socket.emit("messageError", { error: "Message can no longer be edited" });
        return;
      }

      await message.editMessage(content);
      
      // Load updated message with relationships
      const updatedMessage = await Message.findByPk(messageId, {
        include: [
          {
            model: User,
            as: "sender",
            attributes: ['id', 'name', 'email', 'imageUrl']
          },
          {
            model: Message,
            as: "replyToMessage",
            include: [{
              model: User,
              as: "sender",
              attributes: ['id', 'name', 'email', 'imageUrl']
            }]
          }
        ]
      });

      // Notify conversation participants
      const conversation = await Conversation.findByPk(conversationId);
      if (conversation) {
        const otherUserId = conversation.userOneId === userId ? conversation.userTwoId : conversation.userOneId;
        const otherUserSocket = getUserSocket(otherUserId);
        
        if (otherUserSocket) {
          io.to(otherUserSocket).emit("messageEdited", updatedMessage);
        }
        socket.emit("messageEdited", updatedMessage);
      }

    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("messageError", { error: "Failed to edit message" });
    }
  });

  // Delete message
  socket.on("deleteMessage", async (payload: DeleteMessagePayload) => {
    try {
      const { messageId, conversationId } = payload;
      
      const message = await Message.findByPk(messageId);
      if (!message || message.senderId !== userId) {
        socket.emit("messageError", { error: "Unauthorized or message not found" });
        return;
      }

      await message.deleteMessage();

      // Notify conversation participants
      const conversation = await Conversation.findByPk(conversationId);
      if (conversation) {
        const otherUserId = conversation.userOneId === userId ? conversation.userTwoId : conversation.userOneId;
        const otherUserSocket = getUserSocket(otherUserId);
        
        const deletePayload = { messageId, conversationId };
        
        if (otherUserSocket) {
          io.to(otherUserSocket).emit("messageDeleted", deletePayload);
        }
        socket.emit("messageDeleted", deletePayload);
      }

    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("messageError", { error: "Failed to delete message" });
    }
  });

  // Mark message as read
  socket.on("markMessageRead", async (payload: MarkMessageReadPayload) => {
    try {
      const { messageId, conversationId } = payload;
      
      const message = await Message.findByPk(messageId);
      if (!message) return;

      // Only mark as read if current user is not the sender
      if (message.senderId !== userId && !message.isRead()) {
        await message.markAsRead();
        
        // Reset unread count for this user
        const conversation = await Conversation.findByPk(conversationId);
        if (conversation) {
          await conversation.resetUnreadCount(userId);
        }

        // Notify message sender
        const senderSocket = getUserSocket(message.senderId);
        if (senderSocket) {
          io.to(senderSocket).emit("messageRead", {
            messageId,
            readBy: userId,
            readAt: new Date()
          });
        }
      }

    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  });

  // ==================== TYPING EVENTS ====================
  
  socket.on("typing", (payload: TypingPayload) => {
    try {
      const { conversationId, isTyping } = payload;
      
      // Clear existing timeout
      const timeoutKey = `${userId}_${conversationId}`;
      if (typingTimeouts[timeoutKey]) {
        clearTimeout(typingTimeouts[timeoutKey]);
        delete typingTimeouts[timeoutKey];
      }

      // Update socket typing status
      if (!socket.isTyping) socket.isTyping = {};
      socket.isTyping[conversationId] = isTyping;

      // Notify other user in conversation
      notifyTypingStatus(conversationId, userId, isTyping);

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeouts[timeoutKey] = setTimeout(() => {
          if (socket.isTyping) {
            socket.isTyping[conversationId] = false;
          }
          notifyTypingStatus(conversationId, userId, false);
          delete typingTimeouts[timeoutKey];
        }, 3000);
      }

    } catch (error) {
      console.error("Error handling typing:", error);
    }
  });

  // ==================== CONNECTION EVENTS ====================
  
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}, User: ${userId}`);
    
    // Clean up user socket
    removeUserSocket(userId);
    
    // Clear typing timeouts
    Object.keys(typingTimeouts).forEach(key => {
      if (key.startsWith(`${userId}_`)) {
        clearTimeout(typingTimeouts[key]);
        delete typingTimeouts[key];
      }
    });
    
    // Update offline status after a delay (user might reconnect quickly)
    setTimeout(async () => {
      const currentSocket = getUserSocket(userId);
      if (!currentSocket) {
        await updateUserOnlineStatus(userId, false);
      }
    }, 5000);
  });

  // ==================== HELPER FUNCTIONS ====================
  
  function setupHeartbeat(socket: Socket, userId: number) {
    socket.lastHeartbeat = new Date();
    
    socket.on("heartbeat", () => {
      socket.lastHeartbeat = new Date();
    });

    // Send heartbeat request every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeatRequest");
      } else {
        clearInterval(heartbeatInterval);
      }
    }, HEARTBEAT_INTERVAL);

    // Check for offline users every minute
    const offlineCheckInterval = setInterval(async () => {
      if (!socket.connected) {
        clearInterval(offlineCheckInterval);
        return;
      }
      
      const now = new Date();
      const lastHeartbeat = socket.lastHeartbeat || new Date(0);
      
      if (now.getTime() - lastHeartbeat.getTime() > OFFLINE_THRESHOLD) {
        await updateUserOnlineStatus(userId, false);
        socket.disconnect();
        clearInterval(offlineCheckInterval);
      }
    }, 60000);
  }

  async function updateUserOnlineStatus(userId: number, isOnline: boolean) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await user.updateConnectionStatus(isOnline);
        
        // Broadcast status change to all connected users
        io.emit("userStatusChanged", {
          userId,
          isOnline,
          lastSeen: user.lastSeen
        });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  }

  async function notifyTypingStatus(conversationId: number, typingUserId: number, isTyping: boolean) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) return;

      const otherUserId = conversation.userOneId === typingUserId ? 
        conversation.userTwoId : conversation.userOneId;
      
      const otherUserSocket = getUserSocket(otherUserId);
      if (otherUserSocket) {
        io.to(otherUserSocket).emit("userTyping", {
          conversationId,
          userId: typingUserId,
          isTyping
        });
      }
    } catch (error) {
      console.error("Error notifying typing status:", error);
    }
  }
}
