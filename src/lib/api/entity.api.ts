import { apiClient } from "./client";

export const entityApi = {
    getEntity: async (kind: string, id: string) => {
      switch (kind) {
        case "Offer":
          // console.log('ressssssssssssssss' ,apiClient.get(`/coupon/${id}`));
          
          return apiClient.get(`/coupon/${id}`);
        case "Product":
          return apiClient.get(`/product/${id}`);
        case "Order":
          return apiClient.get(`/order/${id}`);
        default:
          throw new Error("Unknown entity type");
      }
    },
  };