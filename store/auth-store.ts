import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserInfo, AuthState as AuthStateType } from '@/types/auth.types';
import { tokenStorage } from '@/lib/axios';

interface AuthState extends AuthStateType {
  // Actions
  setUser: (user: UserInfo | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  reset: () => void;
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
            { accessToken, refreshToken, isAuthenticated: true },
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
            },
            false,
            'logout'
          );
        },
        
        reset: () => {
          tokenStorage.clearTokens();
          set({ ...initialState }, false, 'reset');
        },
        
        initialize: () => {
          // Initialize auth state from storage
          const accessToken = tokenStorage.getAccessToken();
          set({ 
            isAuthenticated: !!accessToken && !tokenStorage.isTokenExpired(),
            isLoading: false,
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

