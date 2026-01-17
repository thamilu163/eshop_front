import apiClient from '@/lib/axios';
import { StoreDTO, ProductDTO, PageResponse, PageRequest } from '@/types';
import { StoreCreateRequest } from '../types';

// Time Complexity: O(1) - single HTTP request
// Space Complexity: O(n) where n is size of response data
export const sellerApi = {
  getMyStore: async (): Promise<StoreDTO> => {
    const { data } = await apiClient.get<StoreDTO>('/api/v1/seller/store');
    return data;
  },

  checkStoreExists: async (): Promise<boolean> => {
    try {
      const { data } = await apiClient.get<boolean>('/api/v1/seller/store/exists');
      return data;
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 403) {
        return false;
      }
      throw error;
    }
  },

  createStore: async (storeData: StoreCreateRequest): Promise<StoreDTO> => {
    console.log('🔍 [createStore] Request payload:', JSON.stringify(storeData, null, 2));
    
    try {
      const { data } = await apiClient.post<StoreDTO>('/api/v1/seller/store', storeData);
      console.log('✅ [createStore] Success:', data);
      return data;
    } catch (error: any) {
      console.error('❌ [createStore] Failed');
      console.error('📦 Payload sent:', storeData);
      console.error('🚨 Backend error:', error.response?.data);
      console.error('📊 Status:', error.response?.status);
      console.error('📋 Headers:', error.response?.headers);
      throw error;
    }
  },

  updateStore: async (storeData: Partial<StoreDTO>): Promise<StoreDTO> => {
    const { data } = await apiClient.put<StoreDTO>('/api/v1/seller/store', storeData);
    return data;
  },

  getMyProducts: async (params: PageRequest): Promise<PageResponse<ProductDTO>> => {
    const { data } = await apiClient.get<PageResponse<ProductDTO>>('/api/seller/products', {
      params,
    });
    return data;
  },

  createProduct: async (productData: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.post<ProductDTO>('/api/seller/products', productData);
    return data;
  },

  updateProduct: async (id: number, productData: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.put<ProductDTO>(`/api/seller/products/${id}`, productData);
    return data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/seller/products/${id}`);
  },

  toggleProductStatus: async (id: number): Promise<ProductDTO> => {
    const { data } = await apiClient.patch<ProductDTO>(`/api/seller/products/${id}/toggle-status`);
    return data;
  },
};
