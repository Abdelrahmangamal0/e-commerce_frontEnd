import { apiClient } from './client';
import { PaginatedResponse, User, UsersResponse } from '@/types';

export const userApi = {
  // Note: This endpoint needs to be added to the backend
  getAllUsers: async (page = 1, size = 10) => {
    const response = await apiClient.get<UsersResponse>('/user/admin/users', {
      params: { page, size },
    });
    return response.data;
  },
};
