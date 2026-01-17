/**
 * Seller API Client
 *
 * API methods for seller operations
 */

import { env } from '@/env';
import type { SellerOnboardingRequest, SellerOnboardingResponse, SellerProfile } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

/**
 * Register a new seller (onboard user as seller)
 */
export async function registerSeller(
  data: SellerOnboardingRequest,
  accessToken: string
): Promise<SellerOnboardingResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/v1/sellers/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Failed to register seller: ${response.status}`;

    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      // Not JSON, use raw text
      errorMessage = errorBody || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const json: ApiResponse<SellerOnboardingResponse> = await response.json();
  return json.data || json; // Fallback to json if data is missing (legacy support)
}

/**
 * Get current user's seller profile
 */
export async function getSellerProfile(accessToken: string): Promise<SellerProfile | null> {
  const response = await fetch(`${env.apiBaseUrl}/api/v1/sellers/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return null; // No seller profile exists
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch seller profile: ${response.status}`);
  }

  const json: ApiResponse<SellerProfile> = await response.json();
  return json.data || json; // Fallback to json if data is missing
}

/**
 * Update seller profile
 */
export async function updateSellerProfile(
  data: Partial<SellerOnboardingRequest>,
  accessToken: string
): Promise<SellerProfile> {
  const response = await fetch(`${env.apiBaseUrl}/api/v1/sellers/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update seller profile: ${response.status}`);
  }

  const json: ApiResponse<SellerProfile> = await response.json();
  return json.data || json; // Fallback to json if data is missing
}
