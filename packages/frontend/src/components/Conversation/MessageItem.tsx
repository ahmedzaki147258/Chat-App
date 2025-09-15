'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageData } from "@/shared/types/message";

interface MessageItemProps {
  message: MessageData;
  isOwnMessage: boolean;
  onImageClick: (imageUrl: string) => void;
  formatTime: (dateString: string) => string;
}

export default function MessageItem({ 
  message, 
  isOwnMessage, 
  onImageClick, 
  formatTime 
}: MessageItemProps) {
  const renderMessageContent = () => {
    if (message.messageType === 'image') {
      return (
        <div className="relative max-w-xs">
          <Image
            src={message.content}
            alt="Shared image"
            width={300}
            height={200}
            className="rounded-lg object-cover cursor-pointer"
            onClick={() => onImageClick(message.content)}
          />
          <div className="text-xs opacity-70 mt-1">
            {formatTime(message.createdAt)}
          </div>
        </div>
      );
    }

    return (
      <div>
        <p>{message.content}</p>
        <div className="text-xs opacity-70 mt-1">
          {formatTime(message.createdAt)}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-primary text-primary-content' 
          : 'bg-base-300 text-base-content'
      }`}>
        {renderMessageContent()}
      </div>
    </motion.div>
  );
}