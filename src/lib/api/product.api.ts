import { apiClient } from './client';
import {
  Product,
  
  PaginatedResponse,
  CreateProductDto,
} from '@/types';

export const productApi = {
  getAll: async (page = 1, size = 10, search?: string): Promise<PaginatedResponse<Product>> => {
    const params: Record<string, any> = { page, size };
    if (search) {
      params.search = search;
    }
    
    const response = await apiClient.get<{ result: PaginatedResponse<Product> }>('/product', {
      params,
    });
    
    // Backend returns: { message, status, data: { result: { docsCount, limit, pages, currentPage, result: [] } } }
    const paginationData = response.data.data?.result;
    if (!paginationData) {
      throw new Error('Invalid response structure from API');
    }
    
    return paginationData;
  },

  getById: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<{ product: Product }>(`/product/${productId}`);
    // Backend returns: { message, status, data: { product: Product } }
    const product = response.data.data?.product;
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  create: async (data: CreateProductDto, files: File[]): Promise<Product> => {
    const formData = new FormData();
    
    formData.append("name", data.name);
    formData.append("brand", data.brand);
    formData.append("category", data.category);
    formData.append("originalPrice", String(data.originalPrice));
    formData.append("stock", String(data.stock));
  
    if (data.description && data.description.length > 0) {
      formData.append("description", data.description);
    }
  
    if (data.discountPercent !== undefined) {
      formData.append("discountPercent", String(data.discountPercent));
    }
  
    files.forEach(file => {
      formData.append("attachments", file);
    });
    const response = await apiClient.postFormData<{ product: Product }>('/product', formData);
    const product = response.data.data?.product;
   
    if (!product) {
      throw new Error('Failed to create product');
    }
    return product;
  },

  update: async (productId: string, data: Partial<CreateProductDto>): Promise<Product> => {
    const response = await apiClient.patch<{ product: Product }>(`/product/${productId}`, data);
    const product = response.data.data?.product;
    if (!product) {
      throw new Error('Failed to update product');
    }
    return product;
  },



  updateAttachments: (
    productId: string,
    files: File[],
    removedAttachments: string[] = []
  ) => {
    const formData = new FormData();
// console.log(files.length);

   if(files.length){
    files.forEach((file) => {
      formData.append("attachments", file);
    });}

    if(removedAttachments.length){
    removedAttachments.forEach((id) => {
    
        formData.append("removedAttachments[]", id);
      
    })};

    return apiClient.patch(`/product/${productId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  softDelete: async (productId: string) => {
    const response = await apiClient.patch(`/product/${productId}/softDelete`);
    return response.data;
  },

  restore: async (productId: string) => {
    const response = await apiClient.patch(`/product/${productId}/restore`);
    return response.data;
  },

  delete: async (productId: string) => {
    const response = await apiClient.delete(`/product/${productId}`);
  //  console.log(response);
   
    return response.data;
  },

  getArchive: async (page = 1, size = 10): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<{ result: PaginatedResponse<Product> }>('/product/archive', {
      params: { page, size },
    });
    const paginationData = response.data.data?.result;
    if (!paginationData) {
      throw new Error('Invalid response structure from API');
    }
    return paginationData;
  },

  addToWishlist: async (productId: string): Promise<Product> => {
    const response = await apiClient.patch<{ product: Product }>(`/product/${productId}/addToWishList`);
    const product = response.data.data?.product;
    if (!product) {
      throw new Error('Failed to add to wishlist');
    }
    return product;
  },

  removeFromWishlist: async (productId: string): Promise<void> => {
    await apiClient.patch(`/product/${productId}/removeFromWishList`);
  },
};
