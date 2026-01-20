/**
 * Admin Orders Hook
 * Hook for managing orders in the admin panel
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById, updateOrderStatus } from '../api';
import type { AdminOrder, OrderFilters, OrderStatus } from '../types';

export const ADMIN_ORDERS_QUERY_KEY = 'admin-orders';

export function useAdminOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: [ADMIN_ORDERS_QUERY_KEY, filters],
    queryFn: () => getOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_QUERY_KEY] });
    },
  });

  return {
    orders: ordersQuery.data?.orders ?? [],
    total: ordersQuery.data?.total ?? 0,
    page: ordersQuery.data?.page ?? 1,
    totalPages: ordersQuery.data?.totalPages ?? 1,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useAdminOrder(id: string) {
  const orderQuery = useQuery<AdminOrder, Error>({
    queryKey: [ADMIN_ORDERS_QUERY_KEY, id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
  };
}
