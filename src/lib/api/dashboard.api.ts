import { apiClient } from './client';
import {
  DashboardOverview,
  DashboardOrdersOverview,
  DashboardUsersOverview,
  DashboardProductsOverview,
} from '@/types';

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get<DashboardOverview>('/dashboard/overview');
    // Backend returns: { message, status, data: DashboardOverview }
    return response.data.data || {};
  },

  getOrdersOverview: async (): Promise<DashboardOrdersOverview> => {
    const response = await apiClient.get<DashboardOrdersOverview>('/dashboard/orders/overview');
    const data = response.data.data;
    if (!data) {
      throw new Error('Failed to get orders overview');
    }
    return data;
  },

  getUsersOverview: async (): Promise<DashboardUsersOverview> => {
    const response = await apiClient.get<DashboardUsersOverview>('/dashboard/users/overview');
    const data = response.data.data;
    if (!data) {
      throw new Error('Failed to get users overview');
    }
    return data;
  },

  getProductsOverview: async (): Promise<DashboardProductsOverview> => {
    const response = await apiClient.get<DashboardProductsOverview>('/dashboard/products/overview');
    const data = response.data.data;
    if (!data) {
      throw new Error('Failed to get products overview');
    }
    return data;
  },
};
