/**
 * Admin Dashboard Hook
 * Hook for fetching and managing admin dashboard data
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getAnalytics } from '../api';
import type { AdminDashboardStats, AdminAnalytics } from '../types';

export const ADMIN_DASHBOARD_QUERY_KEY = 'admin-dashboard';
export const ADMIN_ANALYTICS_QUERY_KEY = 'admin-analytics';

export function useAdminDashboard() {
  const statsQuery = useQuery<AdminDashboardStats, Error>({
    queryKey: [ADMIN_DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

export function useAdminAnalytics(period: AdminAnalytics['period'] = 'month') {
  const analyticsQuery = useQuery<AdminAnalytics, Error>({
    queryKey: [ADMIN_ANALYTICS_QUERY_KEY, period],
    queryFn: () => getAnalytics(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
}
