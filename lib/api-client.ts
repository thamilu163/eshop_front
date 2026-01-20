import type { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options;

    // Handle full URLs if passed as endpoint (though usually endpoint is relative)
    // If endpoint starts with http, use it as is. Otherwise assume it's relative to base.
    // The previous implementation assumed endpoint is a full URL if relative to base, 
    // but URL constructor fails if base is relative (like '/api/v1'). 
    // We need to handle this carefully.
    
    let url: string;
    if (endpoint.startsWith('http')) {
        url = endpoint;
    } else {
        // If baseUrl is relative path (e.g. /api/v1), we can't use new URL(endpoint, baseUrl) without an origin.
        // We'll treat it as string concatenation or handle origin.
        if (this.baseUrl.startsWith('http')) {
             const urlObj = new URL(endpoint, this.baseUrl);
             if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                    urlObj.searchParams.set(key, String(value));
                    }
                });
            }
            url = urlObj.toString();
        } else {
            // Relative base (e.g. /api/v1)
             // Clean slashes
             const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
             const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
             url = `${base}${path}`;
             
             if (params) {
                 const searchParams = new URLSearchParams();
                 Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                      searchParams.set(key, String(value));
                    }
                 });
                 const qs = searchParams.toString();
                 if (qs) url += `?${qs}`;
             }
        }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      };
    }

    return {
      success: true,
      data: data.data || data,
      meta: data.meta,
    };
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient;
