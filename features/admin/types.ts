/**
 * Admin Feature Types
 * Type definitions for admin-specific functionality
 */

// Admin Dashboard Statistics
export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeListings: number;
  recentSignups: number;
}

// User Management Types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
}

export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Category Management Types
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children?: AdminCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  id: string;
}

// Order Management Types
export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    storeName: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sellerId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Product Management Types
export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  status: ProductStatus;
  price: number;
  stock: number;
  seller: {
    id: string;
    storeName: string;
  };
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW' | 'REJECTED';

export interface ProductFilters {
  status?: ProductStatus;
  categoryId?: string;
  sellerId?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Analytics Types
export interface AdminAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  revenue: AnalyticsDataPoint[];
  orders: AnalyticsDataPoint[];
  users: AnalyticsDataPoint[];
  topProducts: TopProduct[];
  topSellers: TopSeller[];
  topCategories: TopCategory[];
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  change?: number;
}

export interface TopProduct {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
}

export interface TopSeller {
  id: string;
  storeName: string;
  salesCount: number;
  revenue: number;
}

export interface TopCategory {
  id: string;
  name: string;
  productCount: number;
  salesCount: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
