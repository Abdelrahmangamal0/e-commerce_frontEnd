import { apiClient } from './client';
import { NotificationResponse, ApiResponse } from '@/types';

export const notificationApi = {
  getAll: async (page = 1, size = 10) => {
    const response = await apiClient.get<NotificationResponse>('/user/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch<ApiResponse>(`/user/${notificationId}/notifications`);
    return response.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/user/notifications/${id}`);
    return res.data.data.notification;
  }
  
};
