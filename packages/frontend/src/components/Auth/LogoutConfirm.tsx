'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface LogoutConfirmProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutConfirm({ isOpen, onClose }: LogoutConfirmProps) {
  const { logout, isLogoutPending } = useAuth();

  const handleConfirm = () => {
    logout();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-base-content mb-2">
                Confirm Logout
              </h3>
              <p className="text-base-content/70">
                Are you sure you want to logout? You&apos;ll need to sign in again to access your conversations.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <motion.button
                className="btn btn-outline flex-1 focus-ring"
                onClick={onClose}
                disabled={isLogoutPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="btn btn-error flex-1 focus-ring"
                onClick={handleConfirm}
                disabled={isLogoutPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLogoutPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging out...
                  </>
                ) : (
                  'Logout'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}