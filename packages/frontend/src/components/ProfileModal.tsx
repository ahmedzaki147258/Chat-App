'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { profileNameSchema, ProfileNameFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { allowedImageFormat, maxImageSize } from '@/shared/types/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { 
    user, 
    updateProfileName, 
    updateProfileImage, 
    isUpdateProfileNamePending, 
    isUpdateProfileImagePending 
  } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileNameFormData>({
    resolver: zodResolver(profileNameSchema),
  });

  useEffect(() => {
    if (user && isOpen) {
      setValue('name', user.name);
      reset({ name: user.name });
    }
  }, [user, isOpen, setValue, reset]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  }, [isOpen]);

  const onSubmit = (data: ProfileNameFormData) => {
    updateProfileName(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedImageFormat.map(ext => `image/${ext}`).includes(file.type)) {
      toast.warning('Please select an image file');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > maxImageSize) {
      toast.warning('File size must be less than 1MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadImage = () => {
    if (selectedFile) {
      updateProfileImage(selectedFile);
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const displayImageUrl = previewUrl || user?.imageUrl;

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
              <h2 className="text-2xl font-bold text-base-content">Profile Settings</h2>
              <button
                className="btn btn-ghost btn-sm btn-circle focus-ring"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <motion.div
                  className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {displayImageUrl ? (
                    <Image
                      src={displayImageUrl}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-content text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">
                      📷 Change
                    </span>
                  </div>
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <motion.div
                  className="mt-4 space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-base-content/70">
                    New image selected: {selectedFile.name}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      className="btn btn-sm btn-primary"
                      onClick={handleUploadImage}
                      disabled={isUpdateProfileImagePending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isUpdateProfileImagePending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="profile-name">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className={`input input-bordered w-full focus-ring ${
                    errors.name ? 'input-error' : ''
                  }`}
                  placeholder="Enter your name"
                  {...register('name')}
                  disabled={isUpdateProfileNamePending}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="profile-email">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="input input-bordered w-full bg-base-200"
                  value={user?.email || ''}
                  disabled
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Email cannot be changed
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="profile-provider">
                  <span className="label-text font-medium">Sign-in Method</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="badge badge-outline">
                    {user?.authProvider === 'google' ? (
                      <>
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
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
                        Google
                      </>
                    ) : (
                      <>
                        📧 Email
                      </>
                    )}
                  </div>
                  {user?.authProvider === 'google' && (
                    <span className="text-xs text-base-content/50">
                      Signed in with Google
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary w-full focus-ring"
                disabled={isUpdateProfileNamePending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUpdateProfileNamePending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </form>

            {/* Account Info */}
            <div className="mt-6 pt-4 border-t border-base-300">
              <div className="text-xs text-base-content/50 space-y-1">
                <p>Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                <p>Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}