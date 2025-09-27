import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: {
      id: number;
      name: string;
      email: string;
    };
    isTyping?: Record<number, boolean>; // conversationId -> isTyping
    lastHeartbeat?: Date;
  }
}