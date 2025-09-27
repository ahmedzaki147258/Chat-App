import httpStatus from "http-status";
import { literal, Op } from "sequelize";
import { Request, Response } from "express";
import { Conversation, User, Message } from "src/db";
import { emitToUser } from "src/utils/socket";

export const getConversationsWithLastMessage = async (req: Request, res: Response) => {
  const userId: number = req.user?.id!;
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { userOneId: userId },
          { userTwoId: userId }
        ]
      },
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
        },
        {
          model: Message,
          as: "messages",
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ['id', 'name', 'email', 'imageUrl']
            }
          ]
        }
      ],
      order: [
        [literal('lastMessageAt'), 'DESC']
      ]
    });

    // Add unread count for current user to each conversation
    const conversationsWithUnread = conversations.map(conv => {
      const convData = conv.toJSON();
      convData.unreadCount = conv.getUnreadCountForUser(userId);
      return convData;
    });

    res.status(httpStatus.OK).json({ status: "success", data: conversationsWithUnread });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const getMessagesByConversationId = async (req: Request, res: Response) => {
  const conversationId: number = +req.params.id;
  const userId: number = req.user?.id!;
  
  try {
    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { userOneId: userId },
          { userTwoId: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(httpStatus.FORBIDDEN).json({ 
        status: "error", 
        message: "Access denied to this conversation" 
      });
    }

    const messages = await Message.findAll({
      where: {
        conversationId
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ['id', 'name', 'email', 'imageUrl', 'isOnline', 'lastSeen']
        },
        {
          model: Message,
          as: "replyToMessage",
          include: [
            {
              model: User,
              as: "sender",
              attributes: ['id', 'name', 'email', 'imageUrl']
            }
          ]
        }
      ],
      order: [
        ["createdAt", "ASC"]
      ]
    });

    // Reset unread count when user opens conversation
    await conversation.resetUnreadCount(userId);

    res.status(httpStatus.OK).json({ status: "success", data: messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const editMessage = async (req: Request, res: Response) => {
  const messageId: number = +req.params.messageId;
  const userId: number = req.user?.id!;
  const { content } = req.body;

  try {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(httpStatus.NOT_FOUND).json({ 
        status: "error", 
        message: "Message not found" 
      });
    }

    if (message.senderId !== userId) {
      return res.status(httpStatus.FORBIDDEN).json({ 
        status: "error", 
        message: "You can only edit your own messages" 
      });
    }

    if (!message.canBeEdited()) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        status: "error", 
        message: "Message can no longer be edited (15 minute limit)" 
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        status: "error", 
        message: "Message content cannot be empty" 
      });
    }

    await message.editMessage(content.trim());

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
          include: [
            {
              model: User,
              as: "sender",
              attributes: ['id', 'name', 'email', 'imageUrl']
            }
          ]
        }
      ]
    });

    res.status(httpStatus.OK).json({ status: "success", data: updatedMessage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  const messageId: number = +req.params.messageId;
  const userId: number = req.user?.id!;

  try {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(httpStatus.NOT_FOUND).json({ 
        status: "error", 
        message: "Message not found" 
      });
    }

    if (message.senderId !== userId) {
      return res.status(httpStatus.FORBIDDEN).json({ 
        status: "error", 
        message: "You can only delete your own messages" 
      });
    }

    if (message.isDeleted) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        status: "error", 
        message: "Message is already deleted" 
      });
    }

    await message.deleteMessage();

    res.status(httpStatus.OK).json({ 
      status: "success", 
      message: "Message deleted successfully" 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  const messageId: number = +req.params.messageId;
  const userId: number = req.user?.id!;

  try {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(httpStatus.NOT_FOUND).json({ 
        status: "error", 
        message: "Message not found" 
      });
    }

    // Only mark as read if current user is not the sender
    if (message.senderId === userId) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        status: "error", 
        message: "Cannot mark own message as read" 
      });
    }

    if (!message.isRead()) {
      await message.markAsRead();
      
      // Reset unread count for this conversation
      const conversation = await Conversation.findByPk(message.conversationId);
      if (conversation) {
        await conversation.resetUnreadCount(userId);
      }
    }

    res.status(httpStatus.OK).json({ 
      status: "success", 
      message: "Message marked as read" 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  const userId: number = req.user?.id!;
  const { receiverId } = req.body;

  if (!receiverId || receiverId === userId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Valid receiver ID is required"
    });
  }

  try {
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { userOneId: userId, userTwoId: receiverId },
          { userOneId: receiverId, userTwoId: userId }
        ]
      },
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

    if (existingConversation) {
      return res.status(httpStatus.OK).json({ status: "success", data: existingConversation });
    }

    // Verify receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: "error",
        message: "Receiver not found"
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      userOneId: userId,
      userTwoId: receiverId
    });

    // Load conversation with user details
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

    // Notify the receiver about the new conversation
    emitToUser(receiverId, "newConversation", fullConversation);

    res.status(httpStatus.CREATED).json({ status: "success", data: fullConversation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const uploadImage = (req: Request, res: Response) => {
  try {
    res.status(httpStatus.OK).json({ status: "success", data: req.file?.path });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};