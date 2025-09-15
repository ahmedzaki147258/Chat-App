'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import AuthModal from './Auth/AuthModal';
import LogoutConfirm from './Auth/LogoutConfirm';
import ProfileModal from './ProfileModal';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleBrandClick = () => {
    router.push('/');
  };

  const handleNewConversation = () => {
    router.push('/conversations');
  };

  const handleProfile = () => {
    setShowProfileModal(true);
    setShowUserMenu(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="navbar bg-base-200 shadow-md sticky top-0 z-30 h-16">
        <div className="navbar-start">
          <motion.button
            className="flex items-center space-x-2 btn btn-ghost normal-case text-xl font-bold focus-ring"
            onClick={handleBrandClick}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <motion.div
              className="text-2xl"
              whileHover={{ 
                scale: 1.1, 
                rotate: 6,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              💬
            </motion.div>
            <span className="gradient-text bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              UltraChat
            </span>
          </motion.button>
        </div>

        <div className="navbar-center">
          {/* Future: Search or navigation */}
        </div>

        <div className="navbar-end space-x-2">
          <ThemeToggle />

          {!isAuthenticated ? (
            <motion.button
              className="btn btn-primary focus-ring"
              onClick={() => setShowAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          ) : (
            <>
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-2 btn btn-ghost focus-ring"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-primary to-secondary w-8 h-8 rounded-full flex items-center justify-center text-primary-content font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="hidden md:inline font-medium">
                    {user?.name || 'User'}
                  </span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUserMenu(false)}
                      />

                      {/* Dropdown Menu */}
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-base-100 rounded-box shadow-lg border border-base-300 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        role="menu"
                        aria-label="User menu"
                      >
                        <div className="p-2">
                          <div className="px-3 py-2 border-b border-base-300 mb-2">
                            <p className="text-sm font-medium text-base-content">
                              {user?.name}
                            </p>
                            <p className="text-xs text-base-content/70">
                              {user?.email}
                            </p>
                          </div>

                          <motion.button
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-base-200 transition-colors focus-ring"
                            onClick={handleProfile}
                            whileHover={{ x: 4 }}
                            role="menuitem"
                          >
                            <span>👤</span>
                            <span>Profile</span>
                          </motion.button>

                          {/* Mobile New Chat */}
                          <motion.button
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-base-200 transition-colors focus-ring sm:hidden"
                            onClick={handleNewConversation}
                            whileHover={{ x: 4 }}
                            role="menuitem"
                          >
                            <span>💬</span>
                            <span>New Chat</span>
                          </motion.button>

                          <motion.button
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-error/10 text-error transition-colors focus-ring"
                            onClick={handleLogoutClick}
                            whileHover={{ x: 4 }}
                            role="menuitem"
                          >
                            <span>🚪</span>
                            <span>Logout</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <LogoutConfirm
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}