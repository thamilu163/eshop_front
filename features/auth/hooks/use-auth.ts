 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth-api-new';
import { useAuthStore } from '@/store/auth-store';
import { setToken } from '@/lib/auth';
import { toast } from 'sonner';
import { LoginRequest, RegisterRequest, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/observability/logger';

// Time Complexity: O(1) for hook setup
// Space Complexity: O(1)
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: logoutStore, isAuthenticated } = useAuthStore();

  // Time Complexity: O(1) - single API call
  // Space Complexity: O(1)
  const loginMutation = useMutation({
    mutationFn: async ({ credentials, rememberMe }: { credentials: LoginRequest; rememberMe?: boolean }) => {
      // Clear query cache to prevent stale data
      queryClient.clear();
      return { response: await authApi.login(credentials), rememberMe };
    },
    onSuccess: ({ response: data, rememberMe = true }) => {
      // Support both response shapes:
      // 1) simplified: { token, user, ... }
      // 2) wrapped: { success: true, data: { token, userId, username, ... } }
      const raw = data as any;

      // If wrapped shape, unwrap
      const wrapped: any = raw?.success && raw?.data ? raw.data : raw;

      // token may be in wrapped.token or wrapped.data.token
      const token = wrapped?.token ?? wrapped?.data?.token ?? null;

      // user may be provided directly or constructed from fields
      const userFromResp = wrapped?.user ?? (wrapped?.data ?? null);

      // normalize user object
      let user = null;
      if (userFromResp) {
        // If user object already provided, use it
        if (userFromResp.id || userFromResp.username) {
          user = userFromResp;
        } else if (wrapped?.userId || wrapped?.data?.userId) {
          const d = wrapped?.data ?? wrapped;
          user = {
            id: d.userId,
            username: d.username,
            email: d.email,
            // Normalize legacy `role` into `roles` array to match UserInfo shape
            roles: d.role ? [d.role] : d.roles ?? undefined,
          };
        }
      }

      if (user && (user as any).role) {
        // convert legacy `role` to `roles` array for consistency
        (user as any).roles = [(user as any).role];
        delete (user as any).role;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Login success payload (normalized):', { token, user, rememberMe });
        console.log('🎭 User roles:', (user as any)?.roles);
        console.log('🔍 UserRole enum check:', {
          ADMIN: UserRole.ADMIN,
          SELLER: UserRole.SELLER,
          DELIVERY_AGENT: UserRole.DELIVERY_AGENT,
          CUSTOMER: UserRole.CUSTOMER
        });
      }
      console.log('✅ Role comparison - ADMIN:', (user as any)?.roles?.includes(UserRole.ADMIN));
      console.log('✅ Role comparison - SELLER:', (user as any)?.roles?.includes(UserRole.SELLER));
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Login success data:', data);
          console.log('📝 Token:', token);
          console.log('👤 User:', user);
          console.log('🎭 User role:', user?.role);
          console.log('🔍 UserRole enum check:', {
            ADMIN: UserRole.ADMIN,
            SELLER: UserRole.SELLER,
            DELIVERY_AGENT: UserRole.DELIVERY_AGENT,
            CUSTOMER: UserRole.CUSTOMER,
          });
          console.log('✅ Role comparison - ADMIN:', user?.role === UserRole.ADMIN);
          console.log('✅ Role comparison - SELLER:', user?.role === UserRole.SELLER);
        }
      // Validate: user object is required. Token may be omitted when server sets httpOnly cookie.
      if (!user) {
        console.error('❌ Login response missing user', { raw });
        return;
      }

      // If token provided in response, persist it; otherwise rely on httpOnly cookie set by server.
      if (token) {
        setToken(token, rememberMe);
      } else {
        if (process.env.NODE_ENV === 'development') console.log('ℹ️ No token in response; relying on httpOnly cookie.');
      }

      setUser(user);
      console.log('💾 Token and user saved to storage (rememberMe:', rememberMe, ')');
            if (process.env.NODE_ENV === 'development') {
              console.log('💾 Token and user saved to storage (rememberMe:', rememberMe, ')');
            }
      
      // Wait a bit to ensure cookie is set
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        const roles = (user as any)?.roles ?? [];
        
        if (roles.includes(UserRole.ADMIN)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Redirecting to /admin');
          }
          router.push('/admin');
        } else if (roles.includes(UserRole.SELLER)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Redirecting to /seller');
          }
          router.push('/seller');
        } else if (roles.includes(UserRole.DELIVERY_AGENT)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Redirecting to /delivery');
          }
          router.push('/delivery');
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Redirecting to home /');
          }
          router.push('/');
        }
      }, 100);
    },
    onError: (error) => {
      console.error('Login error:', error);
          if (process.env.NODE_ENV === 'development') {
            console.error('Login error:', error);
          }
    },
  });

  // Time Complexity: O(1) - single API call
  // Space Complexity: O(1)
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => {
      console.log('🚀 Starting registration mutation with data:', userData);
            if (process.env.NODE_ENV === 'development') {
              console.log('🚀 Starting registration mutation with data:', userData);
            }
      return authApi.register(userData);
    },
    onSuccess: (raw) => {
      // Handle both wrapped and simplified responses
      const resp: any = raw as any;
      const wrapped: any = resp?.success && resp?.data ? resp.data : resp;

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Registration mutation successful, payload:', resp);
        console.log('➡️ Normalized registration data:', wrapped);
      }

      // If backend returned token and user immediately, set auth
      const token = wrapped?.token ?? wrapped?.data?.token ?? null;
      const user: any = wrapped?.user ?? (wrapped?.data ? {
        id: wrapped.data.userId,
        username: wrapped.data.username,
        email: wrapped.data.email,
        role: wrapped.data.role,
      } : null);

      if (token && user) {
        // If API returned credentials, sign the user in
        setToken(token);
        setUser(user);
        if (process.env.NODE_ENV === 'development') console.log('💾 Token and user saved to storage after register');
        // Redirect based on role
        const role = user.role;
        if (role === UserRole.ADMIN) router.push('/admin');
        else if (role === UserRole.SELLER) router.push('/seller');
        else if (role === UserRole.DELIVERY_AGENT) router.push('/delivery');
        else router.push('/');
        return;
      }

      // Otherwise, assume registration succeeded but client should redirect to login
      if (process.env.NODE_ENV === 'development') console.log('ℹ️ Registration completed; redirecting to login');
      // Redirect to login with flag so login page can show toast
      router.push('/auth/login?registered=true');
    },
    onError: (error: unknown) => {
      logger.error('Registration mutation failed:', { error });
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as Record<string, unknown>).response : undefined;
      const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? (errorResponse as Record<string, unknown>).data : undefined;
      const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? (errorResponse as Record<string, unknown>).status : undefined;
      logger.error('Error response:', { errorData });
      logger.error('Error status:', { status: errorStatus });
      
      const errorMessage = 
        (errorData && typeof errorData === 'object' && 'message' in errorData ? String((errorData as Record<string, unknown>).message) : null) ||
        (error && typeof error === 'object' && 'message' in error ? String((error as Record<string, unknown>).message) : null) ||
        'Registration failed. Please try again.';
      toast.error('Registration failed: ' + errorMessage);
    },
  });

  // Time Complexity: O(1)
  // Space Complexity: O(1)
  const logout = () => {
    logoutStore();
    queryClient.clear();
    router.push('/auth/login');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
