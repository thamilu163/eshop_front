import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { apiClient } from '@/lib/api/client';
import axiosClient from '@/lib/axios';
import { mapBackendToUserDTO, validateAuthResponse } from './auth.mappers';
// import { mapUserRole } from '../utils/role-mapper';
import { logger } from '@/lib/observability/logger';

// Time Complexity: O(1) - single HTTP request
// Space Complexity: O(1) - response data
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      // Use centralized apiRequest which unwraps envelopes and handles errors
      const { data: responseData } = await axiosClient.post('/api/v1/auth/login', credentials);
      // Validate contract and map
      validateAuthResponse(responseData);
      const user = mapBackendToUserDTO(responseData);
      // If responseData contains a token, extract it
      const token = (responseData && typeof responseData === 'object' && 'token' in responseData)
        ? String((responseData as { token?: unknown }).token ?? '')
        : '';
      return { user, token };
    } catch (error: unknown) {
      logger.error('Login error:', { error });
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Registering user with data (sanitized):', { userData });
      }
      const cleaned = Object.fromEntries(Object.entries(userData).filter(([_, v]) => v !== undefined));
      const { data: responseData } = await axiosClient.post('/api/v1/auth/register', cleaned);
      // Validate and map
      validateAuthResponse(responseData);
      const user = mapBackendToUserDTO(responseData);
      const token = (responseData && typeof responseData === 'object' && 'token' in responseData)
        ? String((responseData as { token?: unknown }).token ?? '')
        : '';
      return { user, token };
    } catch (error: unknown) {
      logger.error('Registration error:', { error });
      throw error;
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await axiosClient.get('/api/v1/auth/me');
    validateAuthResponse(data);
    const user = mapBackendToUserDTO(data);
    const token = (data && typeof data === 'object' && 'token' in data)
      ? String((data as { token?: unknown }).token ?? '')
      : '';
    return { user, token };
  },

  logout: async (): Promise<void> => {
    // cancel in-flight requests and call logout
    apiClient.cancelAllRequests();
    await axiosClient.post('/api/v1/auth/logout');
  },
};