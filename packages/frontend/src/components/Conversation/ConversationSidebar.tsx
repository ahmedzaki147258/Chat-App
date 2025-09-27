'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { UserData } from "@/shared/types/user";
import { ConversationData } from "@/shared/types/message";
import UserStatus from "./UserStatus";

interface ConversationSidebarProps {
  conversations: ConversationData[];
  selectedConversation: ConversationData | null;
  isLoadingConversations: boolean;
  isConnected: boolean;
  user: UserData | null;
  onSelectConversation: (conversation: ConversationData) => void;
  onNewConversation: () => void;
  onBackToConversations: () => void;
  formatTime: (dateString: string) => string;
}

export default function ConversationSidebar({
  conversations,
  selectedConversation,
  isLoadingConversations,
  isConnected,
  user,
  onSelectConversation,
  onNewConversation,
  onBackToConversations,
  formatTime
}: ConversationSidebarProps) {
  const getOtherUser = (conversation: ConversationData) => {
    return conversation.userOne.id === user?.id ? conversation.userTwo : conversation.userOne;
  };

  const getLastMessagePreview = (conversation: ConversationData) => {
    const lastMessage = conversation.messages[0];
    if (!lastMessage) return 'Start a conversation';
    
    if (lastMessage.isDeleted) return 'This message was deleted';
    if (lastMessage.messageType === 'image') return '📷 Image';
    
    return lastMessage.content;
  };

  return (
    <div className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-base-content cursor-pointer"
            onClick={() => onBackToConversations()}>
            Conversations
          </h1>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onNewConversation}
            title="Start new conversation"
          >
            <span className="text-lg">➕</span>
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
          <span className="text-base-content/70">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="p-4 text-center">
            <span className="loading loading-spinner loading-md"></span>
            <p className="mt-2 text-sm text-base-content/50">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-base-content/50">
            <div className="text-4xl mb-2">💬</div>
            <p className="mb-2">No conversations yet</p>
            <p className="text-xs">Start chatting by clicking the + button</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.messages[0];
            const unreadCount = conversation.unreadCount || 0;
            const isSelected = selectedConversation?.id === conversation.id;
            
            return (
              <motion.div
                key={conversation.id}
                className={`relative p-4 cursor-pointer border-b border-base-300 hover:bg-base-300 transition-colors ${
                  isSelected ? 'bg-base-300 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
                whileHover={{ x: 4 }}
                layout
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        {otherUser.imageUrl ? (
                          <Image 
                            src={otherUser.imageUrl} 
                            alt={otherUser.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Online status indicator */}
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200"></div>
                    )}
                    
                    {/* Unread count badge */}
                    {unreadCount > 0 && !isSelected && (
                      <div className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium truncate ${
                        unreadCount > 0 && !isSelected ? 'text-base-content' : 'text-base-content'
                      }`}>
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-base-content/50 flex-shrink-0 ml-2">
                        {lastMessage ? formatTime(lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    
                    {/* Last message preview */}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        unreadCount > 0 && !isSelected 
                          ? 'text-base-content font-medium' 
                          : 'text-base-content/70'
                      }`}>
                        {lastMessage?.senderId === user?.id && lastMessage ? 'You: ' : ''}
                        {getLastMessagePreview(conversation)}
                      </p>
                    </div>
                    
                    {/* User status */}
                    <div className="mt-1">
                      <UserStatus user={otherUser} className="text-xs" />
                    </div>
                  </div>
                </div>
                
                {/* Message status indicators for sent messages */}
                {lastMessage?.senderId === user?.id && (
                  <div className="absolute bottom-2 right-2 flex items-center">
                    {lastMessage.readAt ? (
                      <div className="w-4 h-4 text-blue-500" title="Read">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M20.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L12 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : lastMessage.deliveredAt ? (
                      <div className="w-4 h-4 text-gray-500" title="Delivered">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M20.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L12 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-4 h-4 text-gray-500" title="Sent">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}