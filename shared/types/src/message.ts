import { UserData } from "./user";

export interface SendMessagePayload {
  content: string;
  messageType: "text" | "image";
  receiverId: number;
  replyToMessageId?: number;
}

export interface EditMessagePayload {
  messageId: number;
  content: string;
  conversationId: number;
}

export interface DeleteMessagePayload {
  messageId: number;
  conversationId: number;
}

export interface MarkMessageReadPayload {
  messageId: number;
  conversationId: number;
}

export interface TypingPayload {
  conversationId: number;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: number;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ConversationData {
  id: number;
  userOneId: number;
  userTwoId: number;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessageAt?: string;
  userOne: UserData;
  userTwo: UserData;
  messages: MessageData[];
}

export interface MessageData {
  id: number;
  content: string;
  messageType: "text" | "image";
  senderId: number;
  conversationId: number;
  readAt: string | null;
  deliveredAt: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  replyToMessageId: number | null;
  replyToMessage?: MessageData | null;
  sender?: UserData;
  createdAt: string;
  updatedAt: string;
}

export interface MessageStatus {
  messageId: number;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

// Socket event types
export interface SocketEvents {
  // Message events
  sendMessage: (payload: SendMessagePayload) => void;
  newMessage: (message: MessageData) => void;
  editMessage: (payload: EditMessagePayload) => void;
  messageEdited: (message: MessageData) => void;
  deleteMessage: (payload: DeleteMessagePayload) => void;
  messageDeleted: (payload: { messageId: number; conversationId: number }) => void;
  markMessageRead: (payload: MarkMessageReadPayload) => void;
  messageRead: (payload: { messageId: number; readBy: number; readAt: Date }) => void;
  
  // Typing events
  typing: (payload: TypingPayload) => void;
  userTyping: (payload: TypingPayload & { userId: number }) => void;
  
  // User status events
  userOnline: (payload: UserStatusPayload) => void;
  userOffline: (payload: UserStatusPayload) => void;
  userStatusChanged: (payload: UserStatusPayload) => void;
  
  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
}