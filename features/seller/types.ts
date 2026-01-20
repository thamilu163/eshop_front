/**
 * Seller Feature Types
 *
 * Type definitions for seller onboarding, profiles, and management
 */

import { SellerIdentityType, SellerBusinessType } from '@/types';

export interface SellerProfile {
  id: string;
  userId: string;
  identityType: SellerIdentityType;
  businessTypes: SellerBusinessType[];
  isOwnProduce?: boolean;
  displayName: string;
  businessName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  description?: string;
  
  // KYC Info
  pan?: string;
  aadhaar?: string;
  businessPan?: string;
  registrationProof?: string;
  authorizedSignatory?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;

  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface SellerOnboardingRequest {
  identityType: SellerIdentityType;
  businessTypes: SellerBusinessType[];
  isOwnProduce?: boolean;
  displayName: string;
  businessName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  description?: string;
  acceptedTerms: boolean;
  message?: string; // Sometimes used for errors/feedback

  // KYC Fields
  pan?: string;
  aadhaar?: string;
  businessPan?: string;
  registrationProof?: string;
  authorizedSignatory?: string;
  
  // Bank Details
  bankAccountNumber?: string;
  bankIfsc?: string;
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

export interface Store {
  id: number;
  storeName: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  sellerId: string;
  // sellerType: string; // Legacy field, might be removed or updated
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreUpdateRequest extends Partial<StoreCreateRequest> {
  id: number;
}
