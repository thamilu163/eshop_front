/**
 * Backend API Service
 * Handles all API calls to Spring Boot backend with JWT authentication
 */

import { getSession } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Generic backend fetch function with authentication
 */
export async function backendFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await getSession();

  console.log('[Backend API] Fetching:', endpoint);
  console.log('[Backend API] Has session:', !!session);
  console.log('[Backend API] Has token:', !!(session as any)?.accessToken);

  if (!session || !(session as any)?.accessToken) {
    console.error('[Backend API] ❌ No access token available');
    throw new Error('No access token available');
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log('[Backend API] URL:', url);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(session as any).accessToken}`,
      ...options.headers,
    },
  });

  console.log('[Backend API] Response status:', response.status);

  if (!response.ok) {
    if (response.status === 401) {
      console.error('[Backend API] ❌ Unauthorized - Token expired or invalid');
      throw new Error('Unauthorized - Token expired or invalid');
    }
    if (response.status === 403) {
      console.error('[Backend API] ❌ Forbidden - Insufficient permissions');
      throw new Error('Forbidden - Insufficient permissions');
    }
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('[Backend API] ❌ API Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Backend API] ✅ Success:', data);
  return data;
}

// Type definitions for API responses
export interface SellerDashboardResponse {
  data: {
    shopOverview: {
      totalProducts: number;
      activeProducts: number;
      outOfStockProducts: number;
      shopRating: number | null;
    };
    orderManagement: {
      newOrders: number;
      processingOrders: number;
      shippedOrders: number;
      completedOrders: number;
    };
    topProducts: Array<{
      productId: number;
      productName: string;
      currentPrice: number;
      category: string;
      stockQuantity: number;
    }>;
  };
  role: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

export interface ProductListResponse {
  products: Product[];
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface OrderListResponse {
  orders: Order[];
}

/**
 * Seller API endpoints
 */
export const sellerApi = {
  getDashboard: () => backendFetch<SellerDashboardResponse>('/api/v1/dashboard/seller'),

  getProducts: () => backendFetch<ProductListResponse>('/api/v1/products/seller'),

  getOrders: () => backendFetch<OrderListResponse>('/api/v1/orders/seller'),
};

/**
 * Server-side backend fetch (for use in Server Components)
 */
export async function serverBackendFetch<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  console.log('[Backend API/Server] Fetching:', url);
  console.log('[Backend API/Server] Has token:', !!accessToken);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    cache: 'no-store',
  });

  console.log('[Backend API/Server] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('[Backend API/Server] ❌ API Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Backend API/Server] ✅ Success');
  return data;
}
