import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  MessageData,
  ConversationData,
  SendMessagePayload,
  EditMessagePayload,
  DeleteMessagePayload,
  MarkMessageReadPayload,
  TypingPayload,
  UserStatusPayload
} from '@/shared/types/message';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  
  // Message operations
  sendMessage: (data: SendMessagePayload) => void;
  editMessage: (data: EditMessagePayload) => void;
  deleteMessage: (data: DeleteMessagePayload) => void;
  markMessageRead: (data: MarkMessageReadPayload) => void;
  
  // Typing operations
  sendTyping: (data: TypingPayload) => void;
  
  // Event listeners
  onNewMessage: (callback: (message: MessageData) => void) => void;
  offNewMessage: (callback: (message: MessageData) => void) => void;
  onMessageEdited: (callback: (message: MessageData) => void) => void;
  offMessageEdited: (callback: (message: MessageData) => void) => void;
  onMessageDeleted: (callback: (data: { messageId: number; conversationId: number }) => void) => void;
  offMessageDeleted: (callback: (data: { messageId: number; conversationId: number }) => void) => void;
  onMessageRead: (callback: (data: { messageId: number; readBy: number; readAt: Date }) => void) => void;
  offMessageRead: (callback: (data: { messageId: number; readBy: number; readAt: Date }) => void) => void;
  onUserTyping: (callback: (data: TypingPayload & { userId: number }) => void) => void;
  offUserTyping: (callback: (data: TypingPayload & { userId: number }) => void) => void;
  onUserStatusChanged: (callback: (data: UserStatusPayload) => void) => void;
  offUserStatusChanged: (callback: (data: UserStatusPayload) => void) => void;
  onNewConversation: (callback: (conversation: ConversationData) => void) => void;
  offNewConversation: (callback: (conversation: ConversationData) => void) => void;
}

export default function useSocket(isAuthenticated?: boolean): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup heartbeat system
  const setupHeartbeat = useCallback((socket: Socket) => {
    // Clear existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Listen for heartbeat requests from server
    socket.on('heartbeatRequest', () => {
      socket.emit('heartbeat');
    });

    // Send periodic heartbeats
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 30000);
  }, []);

  // 🔄 function to connect socket
  const connectSocket = useCallback(() => {
    if (!isAuthenticated) {
      // Don't connect socket if not authenticated
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setupHeartbeat(socket);
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    // Handle connection errors without trying to refresh tokens
    socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
      
             // If it's an auth error, let the axios interceptor handle token refresh
       if (err.message.includes('token') || err.message.includes('auth') || err.message.includes('retry')) {
         // Wait a bit before retrying to allow axios interceptor to refresh token
         if (!reconnectTimeoutRef.current) {
           reconnectTimeoutRef.current = setTimeout(() => {
             if (isAuthenticated) {
               console.log('Retrying socket connection after auth error');
               connectSocket();
             }
             reconnectTimeoutRef.current = null;
           }, 3000); // Increased delay to 3 seconds
         }
       }
    });

    // Handle socket errors
    socket.on('messageError', (data: { error: string }) => {
      toast.error(data.error);
    });

  }, [isAuthenticated, setupHeartbeat]);

  // Connect/disconnect based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      // Add a small delay to ensure access token is available after auth
      const connectTimeout = setTimeout(() => {
        connectSocket();
      }, 500);
      
      return () => clearTimeout(connectTimeout);
    } else {
      // Disconnect socket if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, connectSocket]);

  // ==================== MESSAGE OPERATIONS ====================
  
  const sendMessage = useCallback((data: SendMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', data);
    } else {
      toast.error('Socket is not connected');
    }
  }, []);

  const editMessage = useCallback((data: EditMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('editMessage', data);
    } else {
      toast.error('Socket is not connected');
    }
  }, []);

  const deleteMessage = useCallback((data: DeleteMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('deleteMessage', data);
    } else {
      toast.error('Socket is not connected');
    }
  }, []);

  const markMessageRead = useCallback((data: MarkMessageReadPayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markMessageRead', data);
    }
  }, []);

  const sendTyping = useCallback((data: TypingPayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', data);
    }
  }, []);

  // ==================== EVENT LISTENERS ====================
  
  const onNewMessage = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.on('newMessage', callback);
  }, []);

  const offNewMessage = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.off('newMessage', callback);
  }, []);

  const onMessageEdited = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.on('messageEdited', callback);
  }, []);

  const offMessageEdited = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.off('messageEdited', callback);
  }, []);

  const onMessageDeleted = useCallback((callback: (data: { messageId: number; conversationId: number }) => void) => {
    socketRef.current?.on('messageDeleted', callback);
  }, []);

  const offMessageDeleted = useCallback((callback: (data: { messageId: number; conversationId: number }) => void) => {
    socketRef.current?.off('messageDeleted', callback);
  }, []);

  const onMessageRead = useCallback((callback: (data: { messageId: number; readBy: number; readAt: Date }) => void) => {
    socketRef.current?.on('messageRead', callback);
  }, []);

  const offMessageRead = useCallback((callback: (data: { messageId: number; readBy: number; readAt: Date }) => void) => {
    socketRef.current?.off('messageRead', callback);
  }, []);

  const onUserTyping = useCallback((callback: (data: TypingPayload & { userId: number }) => void) => {
    socketRef.current?.on('userTyping', callback);
  }, []);

  const offUserTyping = useCallback((callback: (data: TypingPayload & { userId: number }) => void) => {
    socketRef.current?.off('userTyping', callback);
  }, []);

  const onUserStatusChanged = useCallback((callback: (data: UserStatusPayload) => void) => {
    socketRef.current?.on('userStatusChanged', callback);
  }, []);

  const offUserStatusChanged = useCallback((callback: (data: UserStatusPayload) => void) => {
    socketRef.current?.off('userStatusChanged', callback);
  }, []);

  const onNewConversation = useCallback((callback: (conversation: ConversationData) => void) => {
    socketRef.current?.on('newConversation', callback);
  }, []);

  const offNewConversation = useCallback((callback: (conversation: ConversationData) => void) => {
    socketRef.current?.off('newConversation', callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    
    // Message operations
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageRead,
    sendTyping,
    
    // Event listeners
    onNewMessage,
    offNewMessage,
    onMessageEdited,
    offMessageEdited,
    onMessageDeleted,
    offMessageDeleted,
    onMessageRead,
    offMessageRead,
    onUserTyping,
    offUserTyping,
    onUserStatusChanged,
    offUserStatusChanged,
    onNewConversation,
    offNewConversation,
  };
}