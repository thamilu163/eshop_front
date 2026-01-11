/**
 * Seller Feature Types
 *
 * Type definitions for seller onboarding, profiles, and management
 */

export type SellerType = 'INDIVIDUAL' | 'BUSINESS' | 'FARMER' | 'WHOLESALER' | 'RETAILER';

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
