/**
 * Authenticated Fetch Hook
 * 
 * Provides fetch wrapper with automatic Bearer token injection
 * and session expiry handling.
 * 
 * @module hooks/use-authenticated-fetch
 */

'use client';

import { useAuth } from './use-auth-nextauth';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8082';

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export interface UseAuthenticatedFetchReturn {
  authFetch: <T = unknown>(endpoint: string, options?: FetchOptions) => Promise<T>;
}

/**
 * Hook for making authenticated API calls
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { authFetch } = useAuthenticatedFetch();
 *   
 *   const loadData = async () => {
 *     try {
 *       const data = await authFetch<Product[]>('/api/v1/products');
 *       setProducts(data);
 *     } catch (error) {
 *       console.error('Failed to load products:', error);
 *     }
 *   };
 *   
 *   return <button onClick={loadData}>Load</button>;
 * }
 * ```
 */
export function useAuthenticatedFetch(): UseAuthenticatedFetchReturn {
  const { accessToken, isAuthenticated, login } = useAuth();

  const authFetch = useCallback(
    async <T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
      if (!isAuthenticated || !accessToken) {
        await login();
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Session expired, trigger re-login
        await login();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message ?? `API Error: ${response.status}`);
      }

      return response.json() as Promise<T>;
    },
    [accessToken, isAuthenticated, login]
  );

  return { authFetch };
}
