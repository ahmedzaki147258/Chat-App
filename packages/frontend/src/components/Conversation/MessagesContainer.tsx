'use client';

import MessageItem from './MessageItem';
import { MessageData } from '@/shared/types/message';
import { useRef, useEffect, forwardRef } from 'react';

interface MessagesContainerProps {
  messages: MessageData[];
  currentUserId: number | undefined;
  isAtBottom: boolean;
  onScroll: () => void;
  onImageClick: (imageUrl: string) => void;
  formatTime: (dateString: string) => string;
}

const MessagesContainer = forwardRef<HTMLDivElement, MessagesContainerProps>(
  (
    { messages, currentUserId, isAtBottom, onScroll, onImageClick, formatTime },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll when messages change
    useEffect(() => {
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, isAtBottom]);

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto p-4 space-y-4"
        onScroll={onScroll}
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
            onImageClick={onImageClick}
            formatTime={formatTime}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessagesContainer.displayName = 'MessagesContainer';

export default MessagesContainer;
