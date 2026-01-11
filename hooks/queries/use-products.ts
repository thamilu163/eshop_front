import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/features/products/api/product-api';
import { queryKeys } from '@/lib/query-keys';
import {
  ProductDTO,
  PageResponse,
  PageRequest,
  ProductFilters,
  CategoryDTO,
  BrandDTO,
  TagDTO,
} from '@/types';

export function useProducts(params?: PageRequest & ProductFilters) {
  const defaults: PageRequest = { page: 0, size: 10 };
  const p = (params ? params : defaults) as PageRequest & ProductFilters;

  return useQuery<PageResponse<ProductDTO>>({
    queryKey: queryKeys.products.list(p),
    queryFn: () => productApi.getProducts(p),
    enabled: true,
  });
}

export function useProduct(id: number) {
  return useQuery<ProductDTO>({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
}

export function useSearchProducts(query: string, params?: PageRequest) {
  return useQuery<PageResponse<ProductDTO>>({
    queryKey: queryKeys.products.search(query, params || {}),
    queryFn: () => productApi.searchProducts(query, params),
    enabled: !!query,
  });
}

export function useFeaturedProducts() {
  return useQuery<ProductDTO[]>({
    queryKey: queryKeys.products.featured(),
    queryFn: () => productApi.getFeaturedProducts(),
    enabled: true,
  });
}

export function useCategories() {
  return useQuery<CategoryDTO[]>({
    queryKey: queryKeys.products.categories(),
    queryFn: () => productApi.getCategories(),
    enabled: true,
  });
}

export function useBrands() {
  return useQuery<BrandDTO[]>({
    queryKey: queryKeys.products.brands(),
    queryFn: () => productApi.getBrands(),
    enabled: true,
  });
}

export function useTags() {
  return useQuery<TagDTO[]>({
    queryKey: queryKeys.products.tags(),
    queryFn: () => productApi.getTags(),
    enabled: true,
  });
}
