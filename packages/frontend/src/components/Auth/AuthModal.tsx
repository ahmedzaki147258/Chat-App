'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/lib/validations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register: registerUser, loginWithGoogle, isLoginPending, isRegisterPending } = useAuth();

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      resetLogin();
      resetRegister();
      setMode(initialMode);
    }
  }, [isOpen, resetLogin, resetRegister, initialMode]);

  const onLoginSubmit = (data: LoginFormData) => {
    login(data, {
			onSuccess: () => {
				onClose(); // close modal after login success
			}
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerUser(data, {
			onSuccess: () => {
				onClose(); // close modal after register success
			}
    });
  };

  const handleGoogleAuth = () => {
    onClose();
    loginWithGoogle();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const isLoading = isLoginPending || isRegisterPending;

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
            className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-base-content"
                key={mode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </motion.h2>
              <button
                className="btn btn-ghost btn-sm btn-circle focus-ring"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Content Container with Animation */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Login Form */}
                    <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="form-control">
                        <label className="label" htmlFor="login-email">
                          <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          className={`input input-bordered w-full focus-ring ${
                            loginErrors.email ? 'input-error' : ''
                          }`}
                          placeholder="Enter your email"
                          {...loginRegister('email')}
                          disabled={isLoading}
                        />
                        {loginErrors.email && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {loginErrors.email.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label" htmlFor="login-password">
                          <span className="label-text font-medium">Password</span>
                        </label>
                        <input
                          id="login-password"
                          type="password"
                          className={`input input-bordered w-full focus-ring ${
                            loginErrors.password ? 'input-error' : ''
                          }`}
                          placeholder="Enter your password"
                          {...loginRegister('password')}
                          disabled={isLoading}
                        />
                        {loginErrors.password && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {loginErrors.password.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        className="btn btn-primary w-full focus-ring"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoginPending ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </motion.button>
                    </form>

                    {/* Switch to Register */}
                    <div className="text-center mt-6">
                      <span className="text-base-content/70">Don't have an account? </span>
                      <button
                        type="button"
                        className="link link-primary font-medium"
                        onClick={() => switchMode('register')}
                        disabled={isLoading}
                      >
                        Create one
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Register Form */}
                    <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="form-control">
                        <label className="label" htmlFor="register-name">
                          <span className="label-text font-medium">Name</span>
                        </label>
                        <input
                          id="register-name"
                          type="text"
                          className={`input input-bordered w-full focus-ring ${
                            registerErrors.name ? 'input-error' : ''
                          }`}
                          placeholder="Enter your name"
                          {...registerRegister('name')}
                          disabled={isLoading}
                        />
                        {registerErrors.name && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {registerErrors.name.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label" htmlFor="register-email">
                          <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          className={`input input-bordered w-full focus-ring ${
                            registerErrors.email ? 'input-error' : ''
                          }`}
                          placeholder="Enter your email"
                          {...registerRegister('email')}
                          disabled={isLoading}
                        />
                        {registerErrors.email && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {registerErrors.email.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label" htmlFor="register-password">
                          <span className="label-text font-medium">Password</span>
                        </label>
                        <input
                          id="register-password"
                          type="password"
                          className={`input input-bordered w-full focus-ring ${
                            registerErrors.password ? 'input-error' : ''
                          }`}
                          placeholder="Enter your password"
                          {...registerRegister('password')}
                          disabled={isLoading}
                        />
                        {registerErrors.password && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {registerErrors.password.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label" htmlFor="register-confirm-password">
                          <span className="label-text font-medium">Confirm Password</span>
                        </label>
                        <input
                          id="register-confirm-password"
                          type="password"
                          className={`input input-bordered w-full focus-ring ${
                            registerErrors.confirmPassword ? 'input-error' : ''
                          }`}
                          placeholder="Confirm your password"
                          {...registerRegister('confirmPassword')}
                          disabled={isLoading}
                        />
                        {registerErrors.confirmPassword && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {registerErrors.confirmPassword.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        className="btn btn-primary w-full focus-ring"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isRegisterPending ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </motion.button>
                    </form>

                    {/* Switch to Login */}
                    <div className="text-center mt-6">
                      <span className="text-base-content/70">Already have an account? </span>
                      <button
                        type="button"
                        className="link link-primary font-medium"
                        onClick={() => switchMode('login')}
                        disabled={isLoading}
                      >
                        Sign in
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="divider my-6">or</div>

            {/* Google Auth Button */}
            <motion.button
              type="button"
              className="btn btn-outline w-full focus-ring"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}