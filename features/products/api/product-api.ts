import apiClient from '@/lib/axios';
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
    const { data } = await apiClient.get<PageResponse<ProductDTO>>('/api/products', { params });
    return data;
  },

  getProductById: async (id: number): Promise<ProductDTO> => {
    const { data } = await apiClient.get<ProductDTO>(`/api/products/${id}`);
    return data;
  },

  updateProduct: async (id: number, payload: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.put<ProductDTO>(`/api/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },

  createProduct: async (payload: Partial<ProductDTO>): Promise<ProductDTO> => {
    const { data } = await apiClient.post<ProductDTO>('/api/products', payload);
    return data;
  },

  searchProducts: async (query: string, params?: PageRequest): Promise<PageResponse<ProductDTO>> => {
    const { data } = await apiClient.get<PageResponse<ProductDTO>>('/api/products/search', {
      params: { query, ...params },
    });
    return data;
  },

  getFeaturedProducts: async (): Promise<ProductDTO[]> => {
    const { data } = await apiClient.get<ProductDTO[]>('/api/products/featured');
    return data;
  },

  getCategories: async (): Promise<CategoryDTO[]> => {
    const { data } = await apiClient.get<CategoryDTO[]>('/api/categories');
    return data;
  },

  getBrands: async (): Promise<BrandDTO[]> => {
    const { data } = await apiClient.get<BrandDTO[]>('/api/brands');
    return data;
  },

  getTags: async (): Promise<TagDTO[]> => {
    const { data } = await apiClient.get<TagDTO[]>('/api/tags');
    return data;
  },
};
