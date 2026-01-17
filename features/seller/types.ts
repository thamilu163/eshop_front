/**
 * Seller Feature Types
 *
 * Type definitions for seller onboarding, profiles, and management
 */

export type SellerType =
  | 'INDIVIDUAL'
  | 'BUSINESS'
  | 'FARMER'
  | 'WHOLESALER'
  | 'RETAILER'
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'BRAND_OWNER';

export interface SellerProfile {
  id: string;
  userId: string;
  sellerType: SellerType;
  displayName: string;
  businessName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  description?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface SellerOnboardingRequest {
  sellerType: SellerType;
  displayName: string;
  businessName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  description?: string;
  acceptedTerms: boolean;
}

export interface SellerOnboardingResponse {
  success: boolean;
  sellerId: string;
  profile: SellerProfile;
  message: string;
}

export interface SellerDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
}

/**
 * Store creation request - matches backend StoreCreateRequest DTO
 * 
 * Note: sellerId and sellerType are auto-populated by the backend controller
 * from the authenticated user's JWT token
 */
export interface StoreCreateRequest {
  storeName: string;          // Required, max 200 chars
  description: string;         // Required, max 1000 chars
  address?: string;            // Optional, max 500 chars
  phone?: string;              // Optional, max 20 chars
  email?: string;              // Optional, max 150 chars
  logoUrl?: string;            // Optional, max 500 chars
  // sellerId and sellerType are auto-populated by backend - DO NOT send from frontend
}
