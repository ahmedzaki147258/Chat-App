'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function ConversationsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Dont render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-base-content/70 mt-1">
                Start a new conversation or continue where you left off
              </p>
            </div>
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">➕</span>
              New Chat
            </motion.button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="font-semibold">Quick Question</h3>
                    <p className="text-sm text-base-content/70">Ask anything</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📝</div>
                  <div>
                    <h3 className="font-semibold">Creative Writing</h3>
                    <p className="text-sm text-base-content/70">Stories, poems, and more</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🔧</div>
                  <div>
                    <h3 className="font-semibold">Problem Solving</h3>
                    <p className="text-sm text-base-content/70">Get help with tasks</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Conversations Placeholder */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title mb-4">Recent Conversations</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-4 p-4 bg-base-100 rounded-lg hover:bg-base-300 cursor-pointer transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-10">
                        <span>AI</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Conversation {i}</h4>
                      <p className="text-sm text-base-content/70">
                        Last message preview...
                      </p>
                    </div>
                    <div className="text-xs text-base-content/50">
                      {i === 1 ? 'Just now' : `${i} hours ago`}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Empty State for New Users */}
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-2">Ready to chat?</h3>
            <p className="text-base-content/70 mb-6">
              Start your first conversation and experience the power of UltraChat
            </p>
            <motion.button
              className="btn btn-primary btn-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🚀</span>
              Start Your First Chat
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}