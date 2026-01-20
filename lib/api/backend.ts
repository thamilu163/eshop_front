/**
 * Backend API Service
 * Handles all API calls to Spring Boot backend with JWT authentication
 */

import { getSession } from 'next-auth/react';
import { logger } from '@/lib/observability/logger';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Generic backend fetch function with authentication
 */
export async function backendFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await getSession();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session as any)?.accessToken) {
    logger.error('[Backend API] ❌ No access token available');
    throw new Error('No access token available');
  }

  const url = `${BACKEND_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Authorization: `Bearer ${(session as any).accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logger.error('[Backend API] ❌ Unauthorized - Token expired or invalid');
      throw new Error('Unauthorized - Token expired or invalid');
    }
    if (response.status === 403) {
      logger.error('[Backend API] ❌ Forbidden - Insufficient permissions');
      throw new Error('Forbidden - Insufficient permissions');
    }
    const errorText = await response.text().catch(() => 'Unknown error');
    logger.error(`[Backend API] ❌ API Error: ${response.status}`, { error: errorText });
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
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

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    
    // 428 is an expected flow for incomplete seller profiles (triggers redirect)
    if (response.status === 428) {
      logger.warn(`[Backend API/Server] ⚠️ Incomplete profile (428): ${errorText}`);
    } else {
      logger.error(`[Backend API/Server] ❌ API Error: ${response.status}`, { error: errorText });
    }
    
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
