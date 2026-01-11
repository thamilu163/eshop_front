/**
 * Shops API Service
 */

import { apiClient } from '../axios';
import type { ShopDTO, PaginatedResponse, ApiResponse } from '@/types';

const SHOPS_BASE = '/api/shops';

export interface ShopCreateRequest {
  shopName: string;
  description: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const shopsApi = {
  getAll: async (params?: { page?: number; size?: number }): Promise<PaginatedResponse<ShopDTO>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ShopDTO>>>(
      SHOPS_BASE,
      { params }
    );
    return response.data.data!;
  },

  getById: async (id: number): Promise<ShopDTO> => {
    const response = await apiClient.get<ApiResponse<ShopDTO>>(`${SHOPS_BASE}/${id}`);
    return response.data.data!;
  },

  getMyShop: async (): Promise<ShopDTO> => {
    const response = await apiClient.get<ApiResponse<ShopDTO>>(`${SHOPS_BASE}/my-shop`);
    return response.data.data!;
  },

  search: async (keyword: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<ShopDTO>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ShopDTO>>>(
      `${SHOPS_BASE}/search`,
      { params: { ...params, keyword } }
    );
    return response.data.data!;
  },

  create: async (data: ShopCreateRequest): Promise<ShopDTO> => {
    const response = await apiClient.post<ApiResponse<ShopDTO>>(SHOPS_BASE, data);
    return response.data.data!;
  },

  update: async (id: number, data: Partial<ShopCreateRequest>): Promise<ShopDTO> => {
    const response = await apiClient.put<ApiResponse<ShopDTO>>(`${SHOPS_BASE}/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${SHOPS_BASE}/${id}`);
  },
};
