'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User authenticated, redirecting to conversations');
      router.replace('/conversations');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.replace('/conversations');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Hero onGetStarted={handleGetStarted} />
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-base-content mb-4">
              Why Choose UltraChat?
            </h2>
            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
              Discover the features that make UltraChat the perfect choice for modern communication
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Lightning Fast',
                description: 'Experience instant responses with our optimized infrastructure and smart caching.',
                color: 'from-primary to-primary-focus'
              },
              {
                icon: '🛡️',
                title: 'Secure & Private',
                description: 'Your conversations are encrypted and protected with enterprise-grade security.',
                color: 'from-secondary to-secondary-focus'
              },
              {
                icon: '🎨',
                title: 'Beautiful Design',
                description: 'Enjoy a stunning interface with multiple themes and smooth animations.',
                color: 'from-accent to-accent-focus'
              },
              {
                icon: '📱',
                title: 'Fully Responsive',
                description: 'Perfect experience across all devices - desktop, tablet, and mobile.',
                color: 'from-info to-info-focus'
              },
              {
                icon: '🌍',
                title: 'Global Access',
                description: 'Connect from anywhere in the world with 99.9% uptime guarantee.',
                color: 'from-success to-success-focus'
              },
              {
                icon: '⚡',
                title: 'AI Powered',
                description: 'Advanced AI capabilities for intelligent and context-aware conversations.',
                color: 'from-warning to-warning-focus'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="card-body text-center">
                  <motion.div
                    className={`text-6xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="card-title justify-center text-xl mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto text-white"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Chatting?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of users who trust UltraChat for their daily communication needs.
            </p>
            <motion.button
              className="btn btn-lg bg-white text-primary hover:bg-base-100 hover:scale-105 px-12"
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <span className="mr-2">💬</span>
              {isAuthenticated ? 'Go to Conversations' : 'Get Started Free'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-hover">About</a>
            <a className="link link-hover">Privacy</a>
            <a className="link link-hover">Terms</a>
            <a className="link link-hover">Support</a>
          </div>
        </div>
        <div>
          <p className="font-bold text-lg">
            UltraChat
            <span className="ml-2">💬</span>
          </p>
          <p className="text-base-content/70">
            The future of conversation, today.
          </p>
          <p className="text-sm text-base-content/50 mt-4">
            Copyright © {new Date().getFullYear()} - All rights reserved
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}