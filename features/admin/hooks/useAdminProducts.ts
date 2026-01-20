/**
 * Admin Products Hook
 * Hook for managing products in the admin panel
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  updateProductStatus,
  toggleProductFeatured,
} from '../api';
import type { AdminProduct, ProductFilters, ProductStatus } from '../types';

export const ADMIN_PRODUCTS_QUERY_KEY = 'admin-products';

export function useAdminProducts(filters?: ProductFilters) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: [ADMIN_PRODUCTS_QUERY_KEY, filters],
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_QUERY_KEY] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      toggleProductFeatured(id, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_QUERY_KEY] });
    },
  });

  return {
    products: productsQuery.data?.products ?? [],
    total: productsQuery.data?.total ?? 0,
    page: productsQuery.data?.page ?? 1,
    totalPages: productsQuery.data?.totalPages ?? 1,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isUpdating: updateStatusMutation.isPending || toggleFeaturedMutation.isPending,
  };
}

export function useAdminProduct(id: string) {
  const productQuery = useQuery<AdminProduct, Error>({
    queryKey: [ADMIN_PRODUCTS_QUERY_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
  };
}
