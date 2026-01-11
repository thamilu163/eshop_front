// src/hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/auth-store';
import { queryClient } from '@/lib/query-client';
import { logger } from '@/lib/observability/logger';

export const useLogout = () => {
  const router = useRouter();
  const { logout: clearAuthState } = useAuthStore();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear auth state
      clearAuthState();
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: (error: unknown) => {
      logger.error('Logout error:', { error });
      // Even if logout fails, clear local state
      clearAuthState();
      queryClient.clear();
      router.push('/login');
    },
  });
};
