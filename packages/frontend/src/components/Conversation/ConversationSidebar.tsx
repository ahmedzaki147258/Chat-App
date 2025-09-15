'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { UserData } from "@/shared/types/user";
import { ConversationData } from "@/shared/types/message";

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
          >
            <span className="text-lg">➕</span>
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
          <span className="text-base-content/70">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="p-4 text-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-base-content/50">
            <div className="text-4xl mb-2">💬</div>
            <p>No conversations</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.messages[0];
            
            return (
              <motion.div
                key={conversation.id}
                className={`p-4 cursor-pointer border-b border-base-300 hover:bg-base-300 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-base-300' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        {otherUser.imageUrl ? (
                          <Image 
                            src={otherUser.imageUrl} 
                            alt={otherUser.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-base-content truncate">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-base-content/50">
                        {lastMessage ? formatTime(lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/70 truncate">
                      {lastMessage ? lastMessage.content : 'Start a conversation'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}