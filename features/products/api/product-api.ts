import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api/endpoints';
import {
  ProductDTO,
  PageResponse,
  PageRequest,
  ProductFilters,
  CategoryDTO,
  BrandDTO,
  TagDTO,
} from '@/types';

// Time Complexity: O(1) - single HTTP request
// Space Complexity: O(n) where n is number of products in response
export const productApi = {
  getProducts: async (
    params: PageRequest & ProductFilters
  ): Promise<PageResponse<ProductDTO>> => {
    const { data } = await apiClient.get<PageResponse<ProductDTO>>(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return data;
  },

  getProductById: async (id: number): Promise<ProductDTO> => {
    const { data } = await apiClient.get<ProductDTO>(API_ENDPOINTS.PRODUCTS.DETAIL(String(id)));
    return data;
  },

  updateProduct: async (id: number, payload: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.put<ProductDTO>(API_ENDPOINTS.PRODUCTS.UPDATE(String(id)), payload);
    return data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(String(id)));
  },

  createProduct: async (payload: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.post<ProductDTO>(API_ENDPOINTS.PRODUCTS.CREATE, payload);
    return data;
  },

  searchProducts: async (query: string, params?: PageRequest): Promise<PageResponse<ProductDTO>> => {
    const { data } = await apiClient.get<PageResponse<ProductDTO>>(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: { query, ...params },
    });
    return data;
  },

  getFeaturedProducts: async (): Promise<ProductDTO[]> => {
    // Note: Featured products doesn't have a direct constant in PRODUCTS currently, 
    // but looking at List or Detail. Let's check endpoints.ts again or use a fallback if missing.
    // Based on endpoints.ts, LIST is /api/v1/products.
    const { data } = await apiClient.get<ProductDTO[]>('/api/v1/products/featured');
    return data;
  },

  getCategories: async (): Promise<CategoryDTO[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.CATEGORIES.LIST);
    // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
    // Extract the actual array from the nested structure
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  getCategoryTree: async (): Promise<CategoryDTO[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.CATEGORIES.TREE);
    // Backend returns: { success: true, data: [...] } for tree endpoint
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  getBrands: async (): Promise<BrandDTO[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.BRANDS.LIST);
    // Handle nested response structure
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  getTags: async (): Promise<TagDTO[]> => {
    const { data } = await apiClient.get<TagDTO[]>(API_ENDPOINTS.TAGS.LIST);
    return data;
  },
};
