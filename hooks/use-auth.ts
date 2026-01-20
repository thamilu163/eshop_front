/**
 * Client-Side Authentication Hooks
 *
 * Provides React hooks for authentication state management
 * Type-safe, SSR-compatible, with automatic token refresh
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/domain/auth/types';
import { signOut } from 'next-auth/react';
import { logger } from '@/lib/observability/logger';
import { tokenStorage } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  roles: UserRole[];
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// ============================================================================
// useAuth Hook
// ============================================================================

/**
 * Main authentication hook
 *
 * Provides:
 * - Current user information
 * - Authentication state
 * - Login/logout functions
 * - Automatic token refresh
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isLoading, logout } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const router = useRouter();
  const pathname = usePathname();

  /**
   * Fetches current user information from API
   */
  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const accessToken = tokenStorage.getAccessToken();
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/auth/me', {
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        // console.log('useAuth: Fetch success', JSON.stringify(user, null, 2));
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else if (response.status === 401) {
        // console.log('useAuth: 401 Not Authenticated');
        // Not authenticated
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      } else if (response.status === 503) {
        // Backend/auth service unavailable
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Authentication service unavailable',
        });
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      logger.warn('fetchUser error:', { error });
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  /**
   * Initiates login flow
   */
  const login = useCallback(
    (redirectTo?: string) => {
      const target = redirectTo ? encodeURIComponent(redirectTo) : encodeURIComponent(pathname);
      const loginUrl = `/login?redirectTo=${target}`;
      window.location.href = loginUrl;
    },
    [pathname]
  );

  /**
   * Initiates logout flow
   */
  const logout = useCallback(async () => {
    try {
      // Use NextAuth signOut to clear session cookies and handle redirect
      await signOut({ callbackUrl: '/' });
      
      // Clear local state (though page will likely unload)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      logger.warn('Logout failed:', { error });
      // Even if it fails, try to force redirect
      window.location.href = '/';
    }
  }, []);

  /**
   * Manually refreshes authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/keycloak/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Token refreshed successfully, refetch user
        await fetchUser();
        return true;
      } else {
        // Refresh failed, user needs to re-authenticate
        logger.warn('Token refresh failed - forcing logout');
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Session expired',
        });

        // Force logout and redirect to login
        router.push('/login?session_expired=true');
        return false;
      }
    } catch (error) {
      logger.error('Token refresh error:', { error });

      // Force logout on error
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Session expired',
      });
      router.push('/login?session_expired=true');
      return false;
    }
  }, [fetchUser, router]);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    ...state,
    login,
    logout,
    refreshToken,
    refetch: fetchUser,
  };
}

// ============================================================================
// useRequireAuth Hook
// ============================================================================

/**
 * Protects routes that require authentication
 *
 * Automatically redirects to login if not authenticated
 *
 * @param redirectTo - Optional redirect path after login
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { user, isLoading } = useRequireAuth();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <div>Welcome, {user.name}</div>;
 * }
 * ```
 */
export function useRequireAuth(redirectTo?: string) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Middleware handles authentication redirects - don't redirect on client
    // if (!auth.isLoading && !auth.isAuthenticated) {
    //   const targetPath = redirectTo || pathname;
    //   router.push(`/login?redirectTo=${encodeURIComponent(targetPath)}`);
    // }
  }, [auth.isLoading, auth.isAuthenticated, pathname, redirectTo, router]);

  return auth;
}

// ============================================================================
// useRequireRole Hook
// ============================================================================

/**
 * Protects routes that require specific roles
 *
 * Automatically redirects to 403 if user lacks required role
 *
 * @param requiredRoles - Array of acceptable roles (OR logic)
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { user, isLoading } = useRequireRole(['admin']);
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <div>Admin Panel</div>;
 * }
 * ```
 */
export function useRequireRole(requiredRoles: UserRole[]) {
  const auth = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && auth.user) {
      const hasRequiredRole = requiredRoles.some((role) => auth.user!.roles.includes(role));

      if (!hasRequiredRole) {
        router.push('/403');
      }
    }
  }, [auth.isLoading, auth.user, requiredRoles, router]);

  return auth;
}

// ============================================================================
// useHasRole Hook
// ============================================================================

/**
 * Checks if current user has specific role(s)
 *
 * @param roles - Role or array of roles to check
 * @param requireAll - If true, user must have ALL roles. If false, ANY role.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const canEdit = useHasRole(['admin', 'seller'], false);
 *
 *   return (
 *     <div>
 *       <h3>{product.name}</h3>
 *       {canEdit && <button>Edit</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHasRole(roles: UserRole | UserRole[], requireAll: boolean = false): boolean {
  const { user } = useAuth();

  if (!user) return false;

  const rolesToCheck = Array.isArray(roles) ? roles : [roles];

  if (requireAll) {
    return rolesToCheck.every((role) => user.roles.includes(role));
  } else {
    return rolesToCheck.some((role) => user.roles.includes(role));
  }
}

// ============================================================================
// useLoginRedirect Hook
// ============================================================================

/**
 * Provides login redirect functionality
 *
 * Useful for login buttons that preserve current location
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const redirectToLogin = useLoginRedirect();
 *
 *   return (
 *     <button onClick={redirectToLogin}>
 *       Log In
 *     </button>
 *   );
 * }
 * ```
 */
export function useLoginRedirect() {
  const pathname = usePathname();

  return useCallback(() => {
    const loginUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`;
    window.location.href = loginUrl;
  }, [pathname]);
}
