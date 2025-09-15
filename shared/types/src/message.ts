import { UserData } from "./user";

export interface SendMessagePayload {
  content: string;
  messageType: "text" | "image";
  receiverId: number;
}

export interface ConversationData {
  id: number;
  userOneId: number;
  userTwoId: number;
  createdAt: string;
  userOne: UserData;
  userTwo: UserData;
  messages: MessageData[];
}

export interface MessageData {
  id: number;
  content: string;
  messageType: string;
  senderId: number;
  conversationId: number;
  createdAt: string;
  updatedAt: string;
}