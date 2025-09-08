'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'cupcake', label: 'Cupcake', icon: '🧁' },
  { value: 'dracula', label: 'Dracula', icon: '🧛' },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsOpen(false);
  };

  const currentTheme = THEMES.find(t => t.value === theme) || THEMES[1];

  return (
    <div className="relative">
      <motion.button
        className="btn btn-ghost btn-circle focus-ring"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg" role="img" aria-label={currentTheme.label}>
          {currentTheme.icon}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-56 bg-base-100 rounded-box shadow-lg border border-base-300 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="menu"
              aria-label="Theme selection"
            >
              <div className="p-2">
                <div className="text-sm font-medium text-base-content/70 px-3 py-2 border-b border-base-300 mb-2">
                  Choose Theme
                </div>
                {THEMES.map((themeOption, index) => (
                  <motion.button
                    key={themeOption.value}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors focus-ring ${
                      theme === themeOption.value
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200 text-base-content'
                    }`}
                    onClick={() => handleThemeChange(themeOption.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    role="menuitem"
                  >
                    <span className="text-lg" role="img" aria-label={themeOption.label}>
                      {themeOption.icon}
                    </span>
                    <span className="font-medium">{themeOption.label}</span>
                    {theme === themeOption.value && (
                      <motion.div
                        className="ml-auto"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}