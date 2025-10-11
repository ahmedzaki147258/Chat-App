'use client';

import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { MessageData } from '@/shared/types/message';
import { UserData } from '@/shared/types/user';
import { useRef, useEffect, forwardRef } from 'react';

interface MessagesContainerProps {
  messages: MessageData[];
  currentUserId: number | undefined;
  isAtBottom: boolean;
  typingUsers: Map<number, UserData>; // userId -> UserData
  onScroll: () => void;
  onImageClick: (imageUrl: string) => void;
  onEditMessage: (messageId: number, content: string) => void;
  onDeleteMessage: (messageId: number) => void;
  onReplyToMessage: (message: MessageData) => void;
  onMarkMessageRead: (messageId: number) => void;
  formatTime: (dateString: string) => string;
}

const MessagesContainer = forwardRef<HTMLDivElement, MessagesContainerProps>(
  (
    { 
      messages, 
      currentUserId, 
      isAtBottom, 
      typingUsers,
      onScroll, 
      onImageClick, 
      onEditMessage,
      onDeleteMessage,
      onReplyToMessage,
      onMarkMessageRead,
      formatTime 
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Auto scroll when messages change
    useEffect(() => {
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, isAtBottom]);

    // Mark messages as read when they come into view
    useEffect(() => {
      if (!currentUserId) return;

      // Clean up existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = parseInt(entry.target.getAttribute('data-message-id') || '0');
              const messageElement = entry.target as HTMLElement;
              const senderId = parseInt(messageElement.getAttribute('data-sender-id') || '0');
              
              if (messageId && senderId !== currentUserId) {
                // Mark message as read if it's not from current user
                onMarkMessageRead(messageId);
              }
            }
          });
        },
        {
          threshold: 0.5, // Message is considered "read" when 50% visible
          root: ref && 'current' in ref ? ref.current : null,
        }
      );

      // Observe all message elements
      const messageElements = document.querySelectorAll('[data-message-id]');
      messageElements.forEach((element) => {
        observerRef.current?.observe(element);
      });

      return () => {
        observerRef.current?.disconnect();
      };
    }, [messages, currentUserId, onMarkMessageRead, ref]);

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4"
        onScroll={onScroll}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            data-message-id={message.id}
            data-sender-id={message.senderId}
          >
            <MessageItem
              message={message}
              isOwnMessage={message.senderId === currentUserId}
              currentUserId={currentUserId || 0}
              onImageClick={onImageClick}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
              onReplyToMessage={onReplyToMessage}
              formatTime={formatTime}
            />
          </div>
        ))}

        {/* Typing indicators */}
        {Array.from(typingUsers.entries()).map(([userId, user]) => (
          <TypingIndicator 
            key={`typing-${userId}`}
            userName={user.name}
            isVisible={true}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessagesContainer.displayName = 'MessagesContainer';

export default MessagesContainer;
