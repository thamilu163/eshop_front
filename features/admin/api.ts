/**
 * Admin Feature API
 * API functions for admin-specific operations
 */

import type {
  AdminDashboardStats,
  AdminUser,
  UserFilters,
  AdminCategory,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  AdminOrder,
  OrderFilters,
  AdminProduct,
  ProductFilters,
  AdminAnalytics,
  AuditLog,
  AuditLogFilters,
} from './types';

const API_BASE = '/api/admin';

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  return fetchApi<AdminDashboardStats>('/dashboard/stats');
}

// User Management API
export async function getUsers(filters?: UserFilters): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  return fetchApi(`/users?${params.toString()}`);
}

export async function getUserById(id: string): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/users/${id}`);
}

export async function updateUserStatus(
  id: string,
  status: AdminUser['status']
): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateUserRole(
  id: string,
  role: AdminUser['role']
): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// Category Management API
export async function getCategories(): Promise<AdminCategory[]> {
  return fetchApi<AdminCategory[]>('/categories');
}

export async function getCategoryById(id: string): Promise<AdminCategory> {
  return fetchApi<AdminCategory>(`/categories/${id}`);
}

export async function createCategory(
  data: CategoryCreateRequest
): Promise<AdminCategory> {
  return fetchApi<AdminCategory>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  data: CategoryUpdateRequest
): Promise<AdminCategory> {
  return fetchApi<AdminCategory>(`/categories/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return fetchApi(`/categories/${id}`, { method: 'DELETE' });
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<AdminCategory[]> {
  return fetchApi<AdminCategory[]>('/categories/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

// Order Management API
export async function getOrders(filters?: OrderFilters): Promise<{
  orders: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  return fetchApi(`/orders?${params.toString()}`);
}

export async function getOrderById(id: string): Promise<AdminOrder> {
  return fetchApi<AdminOrder>(`/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  status: AdminOrder['status']
): Promise<AdminOrder> {
  return fetchApi<AdminOrder>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Product Management API
export async function getProducts(filters?: ProductFilters): Promise<{
  products: AdminProduct[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  return fetchApi(`/products?${params.toString()}`);
}

export async function getProductById(id: string): Promise<AdminProduct> {
  return fetchApi<AdminProduct>(`/products/${id}`);
}

export async function updateProductStatus(
  id: string,
  status: AdminProduct['status']
): Promise<AdminProduct> {
  return fetchApi<AdminProduct>(`/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean
): Promise<AdminProduct> {
  return fetchApi<AdminProduct>(`/products/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ isFeatured }),
  });
}

// Analytics API
export async function getAnalytics(
  period: AdminAnalytics['period'] = 'month'
): Promise<AdminAnalytics> {
  return fetchApi<AdminAnalytics>(`/analytics?period=${period}`);
}

// Audit Log API
export async function getAuditLogs(filters?: AuditLogFilters): Promise<{
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  return fetchApi(`/audit-logs?${params.toString()}`);
}
