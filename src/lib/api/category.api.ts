import { apiClient } from './client';
import { PaginatedResponse } from '@/types';

export const categoryApi = {

  getAll: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get<{ result: PaginatedResponse<any> }>(
      '/category',
      { params: { page, size } }
    );

    
    const paginationData = response.data.data?.result;
    
    if (!paginationData) {
      throw new Error("Invalid response or empty ");
    }
    
    return paginationData;
  },

  getById: async (id: string) => {

    const response = await apiClient.get(`/category/${id}`);

    return response.data.data?.category;
  },

  create: async (data: any, file?: File) => {
    // console.log(data);

    const formData = new FormData();

    formData.append("name", data.name);

    if (data.description?.trim()) {
      formData.append("description", data.description);
    }

    if (data.brands) {
      data.brands.forEach((b: string) => {
      //  console.log(b);
       
        formData.append("brands[]", b);
      });
    }

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.postFormData('/category', formData);

    return response.data.data?.category;
  },

  update: async (id: string, data: any, file?: File) => {

    const formData = new FormData();

    if (data.name) formData.append("name", data.name);

    if (data.description?.trim()) {
      formData.append("description", data.description);
    }

    if (data.brands) {
      data.brands.forEach((b: string) => {
        formData.append("brands", b);
      });
    }

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.patchFormData(
      `/category/${id}`,
      formData
    );

    return response.data.data?.category;
  },

  updateAttachment: async (id: string, file: File) => {

    const formData = new FormData();
    formData.append("attachment", file);

    const response = await apiClient.patchFormData(
      `/category/${id}/attachment`,
      formData
    );

    return response.data.data?.category;
  },

  softDelete: async (id: string) => {
    return apiClient.patch(`/category/${id}/softDelete`);
  },

  restore: async (id: string) => {
    return apiClient.patch(`/category/${id}/restore`);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/category/${id}`);
  },

  getArchive: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get<{ result: PaginatedResponse<any> }>(
      '/category/archive',
      { params: { page, size } }
    );

    const paginationData = response.data.data?.result;
    
    if (!paginationData) {
      throw new Error("Invalid archive response");
    }
    
    return paginationData;
  }

};