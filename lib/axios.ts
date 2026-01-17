import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { ApiError } from '@/types';
import { env } from '@/env';

// Token management utilities for Keycloak
/**
 * SECURITY NOTE: Token Storage
 * 
 * This implementation uses localStorage for token storage, which is standard for
 * NextAuth client-side usage. While localStorage is vulnerable to XSS attacks,
 * this is mitigated by:
 * 
 * 1. React's built-in XSS protection (auto-escaping)
 * 2. Content Security Policy (CSP) headers
 * 3. DOMPurify sanitization for user-generated content
 * 4. Short token expiry times with automatic refresh
 * 
 * Alternative: httpOnly cookies (requires backend coordination for refresh flow)
 * Trade-off: localStorage allows easier client-side token access for API calls
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('token_expiry');
  },

  setTokenExpiry: (expiresIn: number): void => {
    if (typeof window === 'undefined') return;
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('token_expiry', expiryTime.toString());
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    // Add 30 seconds buffer
    return Date.now() > parseInt(expiry) - 30000;
  },
};

// Environment validation
const API_URL = env.apiBaseUrl;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

// Call backend directly to ensure Authorization header is forwarded
// Backend CORS is configured to allow http://localhost:3000
const baseURL = API_URL;

/**
 * Dual Axios Instances
 * 
 * We maintain two identical axios instances for backward compatibility:
 * 
 * 1. apiClient (named export) - Recommended for new code
 * 2. axiosInstance (default export) - Used by legacy services
 * 
 * Both share the same configuration and interceptors. We keep both to avoid
 * breaking changes throughout the codebase. Future refactoring can consolidate
 * all usage to apiClient and remove axiosInstance.
 */

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Legacy instance (default export) - same configuration as apiClient
export const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ❌ REMOVED: Manual token refresh logic
// NextAuth handles token refresh in jwt() callback ONLY
// Do NOT attempt to refresh tokens here - it causes invalid_grant errors

// Shared request interceptor to attach access token from NextAuth session
const authRequestInterceptor = async (config: InternalAxiosRequestConfig) => {
  // Get access token from NextAuth session
  if (typeof window !== 'undefined') {
    // Client-side: use session from SessionProvider
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    if (session?.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  } else {
    // Server-side: attach token if available in localStorage (SSR compatibility)
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
};

const authRequestErrorHandler = (error: any) => {
  return Promise.reject(error);
};

// Apply auth interceptor to both axios instances
apiClient.interceptors.request.use(authRequestInterceptor, authRequestErrorHandler);
axiosInstance.interceptors.request.use(authRequestInterceptor, authRequestErrorHandler);

// Response interceptor for apiClient
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 errors - clear tokens and redirect to login
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();

      // Only redirect on client-side
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Avoid redirect loop on login page
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/api/auth')) {
          window.location.href = `/login?session_expired=true&redirectTo=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor for axiosInstance (same as apiClient)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 errors - clear tokens and redirect to login
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();

      // Only redirect on client-side
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Avoid redirect loop on login page
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/api/auth')) {
          window.location.href = `/login?session_expired=true&redirectTo=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Configure retry logic for both instances
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500
    );
  },
  shouldResetTimeout: true,
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500
    );
  },
  shouldResetTimeout: true,
});

// Development logging for apiClient responses
const loggedErrors = new Set<string>();

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url);
      console.log('📨 Response data:', response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (process.env.NODE_ENV === 'development') {
      const url = error.config?.url || 'unknown';
      const status = error.response?.status || 0;
      const message = error.message || 'Unknown error';
      const errorKey = `${status}-${url}-${message}`;

      // Only log client errors (4xx) and network errors
      // Skip 5xx server errors - they're backend issues shown in UI
      const shouldLog = status < 500 || status === 0;

      if (shouldLog && !loggedErrors.has(errorKey)) {
        loggedErrors.add(errorKey);
        console.error(`❌ API Error [${status || 'network'}] ${url}:`, message);
        if (error.response?.data && Object.keys(error.response.data).length > 0) {
          console.error('   Response:', error.response.data);
        }
      }
    }

    // Transform error for better error messages
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
    };
    if (error.response?.data) {
      const data = error.response.data as {
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      };
      apiError.message = data.message || data.error || apiError.message;
      apiError.errors = data.errors;
    }
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
