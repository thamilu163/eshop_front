import { UserDTO } from '@/types';
import { mapUserRole } from '../utils/role-mapper';

interface BackendAuthResponse {
  token?: string;
  type?: string;
  expiresIn?: number;
  // Backends may return a flattened payload or a nested `user` object
  userId?: number;
  id?: number;
  username?: string;
  email?: string;
  user?: {
    id?: number;
    userId?: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string | string[];
    roles?: string | string[];
    active?: boolean;
    createdAt?: string;
    shopName?: string;
    businessName?: string;
    panNumber?: string;
    gstinNumber?: string;
    businessType?: string;
    sellerType?: string;
    vehicleType?: string;
  };
  firstName?: string;
  lastName?: string;
  role?: string | string[];
  roles?: string | string[];
  active?: boolean;
  createdAt?: string;
  shopName?: string;
  businessName?: string;
  panNumber?: string;
  gstinNumber?: string;
  businessType?: string;
  sellerType?: string;
  vehicleType?: string;
}

export function mapBackendToUserDTO(data: BackendAuthResponse): UserDTO {
  // Support nested `user` payloads or flat payloads
  const src = data.user ?? data;
  const id = Number(src.userId ?? src.id ?? data.userId ?? data.id ?? 0);
  const username = src.username ?? data.username ?? '';
  const email = src.email ?? data.email ?? '';
  const firstName = src.firstName ?? data.firstName ?? username ?? '';
  const lastName = src.lastName ?? data.lastName ?? '';
  const roleVal = (src.role ?? src.roles ?? data.role ?? data.roles) as string | string[] | undefined;

  return {
    id: id,
    username,
    email,
    firstName,
    lastName,
    role: mapUserRole(roleVal),
    active: (src.active ?? data.active) ?? true,
    createdAt: src.createdAt ?? data.createdAt ?? new Date().toISOString(),
    shopName: src.shopName ?? data.shopName,
    businessName: src.businessName ?? data.businessName,
    panNumber: src.panNumber ?? data.panNumber,
    gstinNumber: src.gstinNumber ?? data.gstinNumber,
    businessType: src.businessType ?? data.businessType,
    sellerType: (src.sellerType ?? data.sellerType) as unknown,
    vehicleType: src.vehicleType ?? data.vehicleType,
  } as UserDTO;
}

export function validateAuthResponse(data: unknown): asserts data is BackendAuthResponse {
  if (!data || typeof data !== 'object') throw new Error('Invalid auth response: expected object');
  const d = data as Record<string, unknown>;

  // Accept either a flat payload or a nested `user` object
  const hasFlatId = 'userId' in d || 'id' in d;
  const hasFlatUsername = 'username' in d;
  const userCandidate = (d as Record<string, unknown>).user;
  const hasUserObj = typeof userCandidate === 'object' && userCandidate !== null && (('userId' in userCandidate) || ('id' in userCandidate) || ('username' in userCandidate));

  if (!hasFlatId && !hasUserObj) throw new Error('Invalid auth response: missing userId');
  if (!hasFlatUsername && !hasUserObj) throw new Error('Invalid auth response: missing username');
}
