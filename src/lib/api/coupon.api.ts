import { apiClient } from "@/lib/api/client";
import { PaginatedResponse } from "@/types";

export const couponApi = {

  // Get All Coupons
  getAll: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get(
      "/coupon",
      { params: { page, size } }
    );

    const paginationData = response.data.data?.result;

    if (!paginationData) {
      throw new Error("Invalid coupon response");
    }

    return paginationData;
  },


  // Get One Coupon
  getById: async (id: string) => {

    const response = await apiClient.get(`/coupon/${id}`);

    return response.data.data?.coupon;
  },


  // Create Coupon
  create: async (data: any, file?: File) => {

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("discount", data.discount);

    if (data.duration) {
      formData.append("duration", data.duration);
    }

    if (data.type) {
      formData.append("type", data.type);
    }

    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.postFormData(
      "/coupon",
      formData
    );

    return response.data.data?.coupon;
  },


  // Update Coupon
  update: async (id: string, data: any, file?: File) => {

    const formData = new FormData();

    if (data.name) {
      formData.append("name", data.name);
    }

    if (data.discount) {
      formData.append("discount", data.discount);
    }

    if (data.duration) {
      formData.append("duration", data.duration);
    }

    if (data.type) {
      formData.append("type", data.type);
    }

    if (data.startDate) {
      formData.append("startDate", data.startDate);
    }

    if (data.endDate) {
      formData.append("endDate", data.endDate);
    }

    if (file) {
      formData.append("attachment", file);
    }

    const response = await apiClient.patchFormData(
      `/coupon/${id}`,
      formData
    );

    return response.data.data?.coupon;
  },


  // Update Attachment
  updateAttachment: async (id: string, file: File) => {

    const formData = new FormData();

    formData.append("attachment", file);

    const response = await apiClient.patchFormData(
      `/coupon/${id}/attachment`,
      formData
    );

    return response.data.data?.coupon;
  },


  // Soft Delete
  softDelete: async (id: string) => {

    return apiClient.patch(`/coupon/${id}/softDelete`);
  },


  // Restore
  restore: async (id: string) => {

    return apiClient.patch(`/coupon/${id}/restore`);
  },


  // Delete
  delete: async (id: string) => {

    return apiClient.delete(`/coupon/${id}`);
  },


  // Get Archive
  getArchive: async (page = 1, size = 10): Promise<PaginatedResponse<any>> => {

    const response = await apiClient.get(
      "/coupon/archive",
      { params: { page, size } }
    );

    const paginationData = response.data.data?.result;

    if (!paginationData) {
      throw new Error("Invalid archive response");
    }

    return paginationData;
  }

};