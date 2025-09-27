'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageData } from '@/shared/types/message';
import { XMarkIcon, ReplyIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  newMessage: string;
  isUploadingImage: boolean;
  replyToMessage: MessageData | null;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancelReply: () => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({
  newMessage,
  isUploadingImage,
  replyToMessage,
  onMessageChange,
  onSendMessage,
  onFileSelect,
  onCancelReply,
  onTyping
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // Handle typing indicators
  useEffect(() => {
    if (newMessage.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, isTyping, onTyping]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping) {
        onTyping(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, onTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        onSendMessage();
        // Stop typing indicator immediately when sending
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }
    }
  };

  const handleSendClick = () => {
    if (newMessage.trim()) {
      onSendMessage();
      // Stop typing indicator immediately when sending
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    return (
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ReplyIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Replying to {replyToMessage.sender?.name || 'Unknown'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 pl-6 truncate">
              {replyToMessage.isDeleted 
                ? "This message was deleted" 
                : replyToMessage.messageType === 'image' 
                  ? "📷 Image" 
                  : replyToMessage.content
              }
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Cancel reply"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-base-200 border-t border-base-300">
      {renderReplyPreview()}
      
      <div className="p-4">
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          
          <button
            className="btn btn-circle btn-outline flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            title="Upload image"
          >
            {isUploadingImage ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="text-lg">📷</span>
            )}
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textAreaRef}
              className="textarea textarea-bordered w-full resize-none min-h-[40px] max-h-[120px] pr-12"
              placeholder={replyToMessage ? "Reply to message..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isUploadingImage}
              rows={1}
            />
            
            {newMessage.trim() && (
              <button 
                className="absolute right-2 bottom-2 btn btn-primary btn-sm btn-circle"
                onClick={handleSendClick}
                disabled={isUploadingImage}
                title="Send message (Enter)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Character count for long messages */}
        {newMessage.length > 1000 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/4000
          </div>
        )}
      </div>
    </div>
  );
}