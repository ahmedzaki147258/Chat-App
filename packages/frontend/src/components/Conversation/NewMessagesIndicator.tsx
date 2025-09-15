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
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <motion.button
        className="btn btn-primary btn-sm gap-2 shadow-lg"
        onClick={onScrollToBottom}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-sm">↓</span>
        {newMessagesCount} new message{newMessagesCount > 1 ? 's' : ''}
      </motion.button>
    </div>
  );
}