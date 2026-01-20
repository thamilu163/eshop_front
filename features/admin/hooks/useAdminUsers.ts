/**
 * Admin Users Hook
 * Hook for managing users in the admin panel
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, updateUserStatus, updateUserRole } from '../api';
import type { AdminUser, UserFilters, UserRole, UserStatus } from '../types';

export const ADMIN_USERS_QUERY_KEY = 'admin-users';

export function useAdminUsers(filters?: UserFilters) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, filters],
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });

  return {
    users: usersQuery.data?.users ?? [],
    total: usersQuery.data?.total ?? 0,
    page: usersQuery.data?.page ?? 1,
    totalPages: usersQuery.data?.totalPages ?? 1,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateStatusMutation.isPending || updateRoleMutation.isPending,
  };
}

export function useAdminUser(id: string) {
  const userQuery = useQuery<AdminUser, Error>({
    queryKey: [ADMIN_USERS_QUERY_KEY, id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
  };
}
