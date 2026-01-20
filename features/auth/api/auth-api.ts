import apiClient from '@/lib/axios';
import { logger } from '@/lib/observability/logger';
import { LoginRequest, RegisterRequest, AuthResponse, UserDTO, UserRole, SellerIdentityType, SellerBusinessType } from '@/types';

// Time Complexity: O(1) - single HTTP request
// Space Complexity: O(1) - response data
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      logger.debug('Full backend response', { status: response.status });

      // Backend returns { success, message, data: { ... } }
      const apiResponse = response.data;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Login failed');
      }

      // Extract the actual data from the wrapper
      const responseData = apiResponse.data as Record<string, unknown>;

      const role = responseData.role as string | undefined;

      // Build user object from backend response
      const user: UserDTO = {
        id: Number(responseData.userId as unknown) || 0,
        username: (responseData.username as string) ?? '',
        email: responseData.email as string ?? '',
        firstName: (responseData.firstName as string) ?? (responseData.username as string) ?? '',
        lastName: (responseData.lastName as string) ?? '',
        role: role === 'ADMIN' ? UserRole.ADMIN : role === 'SELLER' ? UserRole.SELLER : role === 'DELIVERY_AGENT' ? UserRole.DELIVERY_AGENT : UserRole.CUSTOMER,
        active: Boolean(responseData.active ?? true),
        createdAt: (responseData.createdAt as string) ?? new Date().toISOString(),
        // Seller-specific fields
        shopName: responseData.shopName as string | undefined,
        businessName: responseData.businessName as string | undefined,
        panNumber: responseData.panNumber as string | undefined,
        gstinNumber: responseData.gstinNumber as string | undefined,
        businessType: responseData.businessType as string | undefined,
        // Delivery agent fields
        vehicleType: responseData.vehicleType as string | undefined,
      };

      logger.debug('Created user object from response', { id: user.id, role: user.role });

      return {
        token: responseData.token as string | undefined,
        type: responseData.type as string | undefined,
        user,
        expiresIn: responseData.expiresIn as number | undefined,
      };
    } catch (error: unknown) {
      logger.error('Login error', { err: error });
      const e = error as { response?: { data?: Record<string, unknown> }; message?: string };
      const errorMessage = e?.response?.data?.['message' as string] as string | undefined
        ?? (e?.response?.data?.['data' as string] as string | undefined)
        ?? e?.message
        ?? 'Login failed';
      throw new Error(errorMessage);
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      logger.debug('Registering user', { payloadSize: JSON.stringify(userData).length });

      const cleaned = JSON.parse(JSON.stringify(userData));
      const response = await apiClient.post('/auth/register', cleaned, { headers: { 'Content-Type': 'application/json' } });

      logger.debug('Registration response received', { status: response.status });

      const responseData = response.data as Record<string, unknown>;

      // Backend returns: { success: true, message: "...", data: { token, userId, username, email, role, ... } }
      if (responseData.success && responseData.data) {
        const innerData = responseData.data as Record<string, unknown>;

        // Extract token
        const token = (innerData.token as string | undefined) ?? (innerData.jwt as string | undefined) ?? (innerData.accessToken as string | undefined);

        // Build a UserDTO that matches our `UserDTO` shape
        const user: UserDTO = {
          id: Number(innerData.userId as unknown) || 0,
          username: (innerData.username as string) ?? '',
          email: innerData.email as string ?? '',
          firstName: (innerData.firstName as string) ?? (innerData.username as string) ?? '',
          lastName: (innerData.lastName as string) ?? '',
          role: (innerData.role as string) === 'ADMIN' ? UserRole.ADMIN : (innerData.role as string) === 'SELLER' ? UserRole.SELLER : (innerData.role as string) === 'DELIVERY_AGENT' ? UserRole.DELIVERY_AGENT : UserRole.CUSTOMER,
          phone: innerData.phone as string | undefined,
          address: innerData.address as string | undefined,
          active: Boolean(innerData.active ?? true),
          createdAt: (innerData.createdAt as string) ?? new Date().toISOString(),
          // Seller-specific fields
          shopName: innerData.shopName as string | undefined,
          businessName: innerData.businessName as string | undefined,
          panNumber: innerData.panNumber as string | undefined,
          gstinNumber: innerData.gstinNumber as string | undefined,
          businessType: innerData.businessType as string | undefined,
          sellerIdentityType: innerData.sellerIdentityType ? (innerData.sellerIdentityType as SellerIdentityType) : undefined,
          sellerBusinessTypes: innerData.sellerBusinessTypes ? (innerData.sellerBusinessTypes as SellerBusinessType[]) : undefined,
          // Delivery agent fields
          vehicleType: innerData.vehicleType as string | undefined,
        };

        if (token && user.id && user.role) {
          logger.info('Registration succeeded', { userId: user.id });
          return { token, user };
        }

        logger.warn('Missing required fields in registration response', { token, userId: user.id });
      }

      logger.error('Unexpected response structure from auth/register');
      throw new Error('Invalid response structure from server');
    } catch (error: unknown) {
      logger.error('Registration error', { err: error });
      throw error;
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.get<AuthResponse>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
