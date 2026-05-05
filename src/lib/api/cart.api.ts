import { apiClient } from './client';
import { CartResponse, CreateCartDto, RemoveItemsFromCartDto, Cart } from '@/types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<{ cart: Cart }>('/cart');
    // Backend returns: { message, status, data: { cart: Cart } }
    const cart = response.data.data?.cart;
   console.log(cart);
   
    if (!cart) {
      throw new Error('Cart not found');
    }
    return cart;
  },

  addToCart: async (data: CreateCartDto): Promise<Cart> => {
    const response = await apiClient.post<{ cart: Cart }>('/cart', data);
    const cart = response.data.data?.cart;
    if (!cart) {
      throw new Error('Failed to add to cart');
    }
    return cart;
  },

  removeFromCart: async (data: RemoveItemsFromCartDto): Promise<Cart> => {
    console.log('respose', data);
    
    const response = await apiClient.patch<{ cart: Cart }>('/cart', data);
    console.log('response---------' , response);
    
    const cart = response.data.data?.cart;
    
    if (!cart) {
      throw new Error('Failed to remove from cart');
    }
    return cart;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },
};
