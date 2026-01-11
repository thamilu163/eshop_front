import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserDTO } from '@/types';
import { UserInfo, AuthState as AuthStateType } from '@/types/auth.types';
import { tokenStorage } from '@/lib/axios';

interface AuthState extends AuthStateType {
  // Legacy compatibility
  token?: string | null;
  
  // Actions
  setUser: (user: UserInfo | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  reset: () => void;
  
  // Legacy actions for compatibility
  setUserLegacy: (user: UserDTO, token?: string | null) => void;
  initialize: () => void;
}

const initialState: AuthStateType = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        token: null,
        
          setUser: (user) => {
            const cur = get().user;
            try {
              if (JSON.stringify(cur) === JSON.stringify(user)) return;
            } catch {
              // fallback: if stringify fails, still attempt to set
            }
            set({ user }, false, 'setUser');
          },
        
        setTokens: (accessToken, refreshToken) => {
          const cur = get();
          if (cur.accessToken === accessToken && cur.refreshToken === refreshToken && cur.isAuthenticated) {
            tokenStorage.setTokens(accessToken, refreshToken);
            return;
          }
          tokenStorage.setTokens(accessToken, refreshToken);
          set(
            { accessToken, refreshToken, isAuthenticated: true, token: accessToken },
            false,
            'setTokens'
          );
        },
        
        setAuthenticated: (isAuthenticated) => {
          const cur = get().isAuthenticated;
          if (cur === isAuthenticated) return;
          set({ isAuthenticated }, false, 'setAuthenticated');
        },
        
        setLoading: (isLoading) => {
          const cur = get().isLoading;
          if (cur === isLoading) return;
          set({ isLoading }, false, 'setLoading');
        },
        
        logout: () => {
          tokenStorage.clearTokens();
          set(
            {
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              token: null,
            },
            false,
            'logout'
          );
        },
        
        reset: () => {
          tokenStorage.clearTokens();
          set({ ...initialState, token: null }, false, 'reset');
        },
        
        // Legacy compatibility methods
        setUserLegacy: (user, token) => {
          const mappedUser: UserInfo = {
            sub: String(user.id),
            preferred_username: user.username,
            username: user.username,
            email: user.email,
            email_verified: !!user.emailVerified,
            given_name: user.firstName,
            family_name: user.lastName,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            roles: user.role ? [String(user.role)] : undefined,
            phone: user.phone,
            address: user.address,
            shopName: user.shopName || user.businessName,
            // preserve other backend fields if present
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as UserInfo;

          const cur = get().user;
          try {
            if (JSON.stringify(cur) === JSON.stringify(mappedUser)) return;
          } catch {}
          set({ user: mappedUser, isAuthenticated: true, token: token ?? null });
        },
        
        initialize: () => {
          // Initialize auth state from storage
          const accessToken = tokenStorage.getAccessToken();
          set({ 
            isAuthenticated: !!accessToken && !tokenStorage.isTokenExpired(),
            isLoading: false,
            token: accessToken,
            accessToken,
          });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

