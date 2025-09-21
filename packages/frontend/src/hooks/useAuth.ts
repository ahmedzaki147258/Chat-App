'use client';

import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { UserData } from '@/shared/types/user';
import { ApiResponse } from '@/shared/types/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types';

const AUTH_QUERY_KEY = ['auth', 'user'];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading, error } = useQuery<UserData | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<UserData | null> => {
      try {
        const { data: res } = await apiClient.get<ApiResponse<UserData>>('/api/auth/me');
        return res.data ?? null;  // always return User or null
      } catch {
        return null; // never return undefined
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data: res } = await apiClient.post<ApiResponse<UserData>>('/api/auth/login', credentials);
      return res.data!;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/conversations');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const { data: res } = await apiClient.post<ApiResponse<UserData>>('/api/auth/register', userData);
      return res.data!;
    },
    onSuccess: (user) => {
      toast.success(`Registration successful, please login to continue`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed');
    },
  });

  // Update profile name mutation
  const updateProfileNameMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const { data: res } = await apiClient.patch<ApiResponse<UserData>>('/api/users', data);
      return res.data!;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Update profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data: res } = await apiClient.patch<ApiResponse<UserData>>('/api/users/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data!;
    },
    onMutate: () => {
      const toast_id = toast.loading('Updating profile image...');
      return { toast_id }; // returned as context
    },
    onSuccess: (updatedUser, _, context) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
      toast.success('Profile image updated successfully', { id: context?.toast_id });
    },
    onError: (error: Error, _, context) => {
      toast.error(error.message || 'Failed to update profile image', { id: context?.toast_id });
    },
  });

  // Google OAuth
  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfileName: updateProfileNameMutation.mutate,
    updateProfileImage: updateProfileImageMutation.mutate,
    loginWithGoogle,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isUpdateProfileNamePending: updateProfileNameMutation.isPending,
    isUpdateProfileImagePending: updateProfileImageMutation.isPending,
  };
}