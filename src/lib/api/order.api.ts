import { apiClient } from './client';
import { OrderResponse, CreateOrderDto, CheckoutSession, PaginatedResponse, Order } from '@/types';

export const orderApi = {
  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<{ order: Order }>('/order', data);
    // Backend returns: { message, status, data: { order: Order } }
    const order = response.data.data?.order;
    if (!order) {
      throw new Error('Failed to create order');
    }
    return order;
  },

  cancel: async (orderId: string): Promise<Order> => {
    const response = await apiClient.patch<{ order: Order }>(`/order/${orderId}`);
    const order = response.data.data?.order;
    if (!order) {
      throw new Error('Failed to cancel order');
    }
    return order;
  },

  checkout: async (orderId: string): Promise<CheckoutSession> => {
       console.log('her1');
       
       const response = await apiClient.post<{ session: CheckoutSession }>(`/order/${orderId}`);
       console.log('her2');
       console.log(response);
       console.log('her3');
    
    // Backend returns: { message, status, data: { session: CheckoutSession } }
    const session = response.data.data?.session;
    if (!session) {
      throw new Error('Failed to create checkout session');
    }
    return session;
  },

  // Note: These endpoints need to be added to the backend
  getUserOrders: async (page = 1, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/order/user/orders', {
      params: { page, size },
    });
    return response.data;
  },

  getAllOrders: async (page = 1, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/order/admin/orders', {
      params: { page, size },
    });
    return response.data;
  },
};
