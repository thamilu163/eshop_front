import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { ApiError } from '@/types';
import { env } from '@/env';

// Token management utilities for Keycloak
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

// Legacy token storage (keep for backward compatibility)
class _StorageService {
  static isBrowser = typeof window !== 'undefined';
  static getToken(): string | null {
    return tokenStorage.getAccessToken();
  }
  static setToken(token: string, _remember: boolean = false): void {
    if (!this.isBrowser) return;
    // For backward compatibility, treat as access token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }
  static clearAuth(): void {
    tokenStorage.clearTokens();
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }
}

// Reference legacy storage class to avoid unused-var lint warnings (kept for compatibility)
void _StorageService;

// Environment validation
const API_URL = env.apiBaseUrl;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

// Call backend directly to ensure Authorization header is forwarded
// Backend CORS is configured to allow http://localhost:3000
const baseURL = API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Keycloak-compatible axios instance
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
  // Skip auth for public endpoints
  const publicEndpoints = [
    '/api/auth/',
    '/api/public/',
    '/api/products',
    '/api/categories',
    '/api/brands',
    '/api/tags',
  ];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

  if (isPublicEndpoint) {
    return config;
  }

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
