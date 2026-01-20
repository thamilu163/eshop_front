/**
 * Admin Categories Hook
 * Hook for managing categories in the admin panel
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../api';
import type {
  AdminCategory,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from '../types';

export const ADMIN_CATEGORIES_QUERY_KEY = 'admin-categories';

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<AdminCategory[], Error>({
    queryKey: [ADMIN_CATEGORIES_QUERY_KEY],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryUpdateRequest) => updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderCategories(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    reorder: reorderMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}

export function useAdminCategory(id: string) {
  const categoryQuery = useQuery<AdminCategory, Error>({
    queryKey: [ADMIN_CATEGORIES_QUERY_KEY, id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });

  return {
    category: categoryQuery.data,
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
  };
}
