'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userName: string;
  isVisible: boolean;
}

export default function TypingIndicator({ userName, isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-2"
    >
      <div className="bg-base-300 text-base-content px-3 md:px-4 py-1.5 md:py-2 rounded-lg max-w-xs">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-xs md:text-sm opacity-70">{userName} is typing</span>
          <div className="flex gap-0.5 md:gap-1">
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full opacity-60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full opacity-60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full opacity-60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
