'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types';
import { UserData } from '@/shared/types/user';
import { ApiResponse } from '@/shared/types/api';

const AUTH_QUERY_KEY = ['auth', 'user'];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading, error } = useQuery<UserData | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<UserData | null> => {
      try {
        const response = await apiClient.get<ApiResponse<UserData>>('/api/auth/me');
        return response.data!; // always return User or null
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
      const response = await apiClient.post<ApiResponse<UserData>>('/api/auth/login', credentials);
      return response.data!;
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
      const response = await apiClient.post<ApiResponse<UserData>>('/api/auth/register', userData);
      return response.data!;
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
      const response = await apiClient.patch<ApiResponse<UserData>>('/api/users', data);
      return response.data!;
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
      const response = await apiClient.patchFormData<ApiResponse<UserData>>('/api/users/image', formData);
      return response.data!;
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