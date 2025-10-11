'use client';

import { motion } from 'framer-motion';

interface NewMessagesIndicatorProps {
  newMessagesCount: number;
  onScrollToBottom: () => void;
}

export default function NewMessagesIndicator({ 
  newMessagesCount, 
  onScrollToBottom 
}: NewMessagesIndicatorProps) {
  if (newMessagesCount === 0) return null;

  return (
    <div className="absolute bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <motion.button
        className="btn btn-primary btn-xs md:btn-sm gap-1 md:gap-2 shadow-lg text-xs md:text-sm"
        onClick={onScrollToBottom}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label={`${newMessagesCount} new message${newMessagesCount > 1 ? 's' : ''}`}
      >
        <span className="text-sm md:text-base">↓</span>
        {newMessagesCount} new message{newMessagesCount > 1 ? 's' : ''}
      </motion.button>
    </div>
  );
}