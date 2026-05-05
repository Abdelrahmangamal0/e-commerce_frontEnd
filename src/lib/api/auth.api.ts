import { apiClient } from './client';
import { LoginDto, LoginResponse, SignupDto, User, ProfileResponse } from '@/types';
import { tokenStorage } from './token.storage';

export const authApi = {
  signup: async (data: SignupDto): Promise<{ user: User }> => {
    const response = await apiClient.post<{ user: User }>('/auth/signup', data);
    // Backend returns: { message, status, data: { user: User } }
    return response.data.data || { user: response.data as any };
  },

  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    // console.log(response);
    
    // Backend returns: { message, status, data: { credentials: {...} } }
    const loginData = response.data.data;
    if (!loginData) {
      throw new Error('Login failed');
    }
    return loginData;
  },

  resendEmailOtp: async (email: string) => {
    const response = await apiClient.post('/auth/resend_email_otp', { email });
    return response.data;
  },

  confirmEmail: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/confirm_email', { email, otp });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyPassword: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-password', { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, password: string, confirmPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      password,
      confirmPassword,
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ profile: User }>('/user/profile');
    // Backend returns: { message, status, data: { profile: User } }
   
    const profile = response.data.data?.profile;
    if (!profile) {
      throw new Error('Failed to get profile');
    }
    return profile;
  },

  updateProfileImage: async (file: File): Promise<User> => {
    const formData = new FormData();
   
    formData.append('profileImage', file);
    const response = await apiClient.patchFormData<{ profile: User }>('/user/profileImage', formData);
    const profile = response.data.data?.profile;
    if (!profile) {
      throw new Error('Failed to update profile image');
    }
    return profile;
  },

  updatePassword: async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await apiClient.patch('/user/update-password', data);
    return response.data;
  },
  // src/lib/api/auth.api.ts — update logout
logout: async () => {
  // Send refresh token in Authorization header (guard requires it)
  const signature    = tokenStorage.getSignature();
  const refreshToken = tokenStorage.getRefresh();
  
  const response = await apiClient.post(
    '/auth/logout',
    {},
    {
      headers: {
        Authorization: `${signature} ${refreshToken}`,
      },
    },
  );
  return response.data;
},
};
