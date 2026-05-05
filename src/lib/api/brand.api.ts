import { apiClient } from './client';
import { PaginatedResponse } from '@/types';

export const brandApi = {

  // ✅ Get All
  getAll: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get<{ result: PaginatedResponse<any> }>('/brand', {
      params: { page, size },
    });

    const paginationData = response.data.data?.result;

    if (!paginationData) throw new Error("Invalid response structure");

    return paginationData;
  },

  // ✅ Get By Id
  getById: async (id: string) => {

    const response = await apiClient.get(`/brand/${id}`);

    const brand = response.data.data?.brand;

    if (!brand) throw new Error("Brand not found");

    return brand;
  },

  // ✅ Create
  create: async (data: any, file?: File) => {

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("slogan", data.slogan);

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.postFormData('/brand', formData);

    return response.data.data?.brand;
  },

  // ✅ Update
  update: async (id: string, data: any, file?: File) => {

    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.slogan) formData.append("slogan", data.slogan);

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.patchFormData(`/brand/${id}`, formData);

    return response.data.data?.brand;
  },

  // ✅ Update Attachment (attachment only)
  updateAttachment: async (id: string, file: File) => {

    const formData = new FormData();
    formData.append("attachment", file);

    const response = await apiClient.patchFormData(
      `/brand/${id}/attachment`,
      formData
    );

    return response.data.data?.brand;
  },

  // ✅ Soft Delete
  softDelete: async (id: string) => {
    return apiClient.patch(`/brand/${id}/softDelete`);
  },

  // ✅ Restore
  restore: async (id: string) => {
    return apiClient.patch(`/brand/${id}/restore`);
  },

  // ✅ Delete
  delete: async (id: string) => {
    return apiClient.delete(`/brand/${id}`);
  },

  // ✅ Archive
  getArchive: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get<{ result: PaginatedResponse<any> }>(
      '/brand/archive',
      { params: { page, size } }
    );
    
    const paginationData = response.data.data?.result;
    
    if (!paginationData) {
      throw new Error("Invalid archive response");
    }
    
    return paginationData;
  }
};