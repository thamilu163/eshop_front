/**
 * Providers Component
 *
 * Enterprise provider hierarchy with:
 * - React Query for data fetching and caching
 * - NextAuth authentication with Keycloak
 * - Theme provider for dark mode
 * - Toast notifications
 * - Analytics tracking
 * - Error boundaries
 * - Accessibility features
 *
 * @module app/providers
 */

'use client';

import { useState, useEffect, type ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import NextAuthProvider from '@/components/NextAuthProvider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { NetworkStatus } from '@/components/common/network-status';
import { ScreenReaderAnnouncer } from '@/components/common/screen-reader-announcer';
import { useAuthStore } from '@/store/auth-store';
import { useAppIntegrations } from '@/hooks/use-app-integrations';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Create Query Client with enterprise configuration
 *
 * Features:
 * - Smart retry logic (don't retry 4xx errors)
 * - Exponential backoff
 * - Stale-while-revalidate caching
 * - Garbage collection
 * - Structural sharing for performance
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 5 minutes (reduced refetching)
        staleTime: 5 * 60 * 1000,
        // Unused data garbage collected after 10 minutes
        gcTime: 10 * 60 * 1000,
        // Smart retry logic
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry up to 2 times for server errors
          return failureCount < 2;
        },
        // Exponential backoff: 1s, 2s, 4s (max 30s)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Disable aggressive refetching to reduce API calls
        refetchOnWindowFocus: false, // Changed from production check
        refetchOnReconnect: false, // Disable reconnect refetch
        refetchOnMount: false, // Only fetch if data is stale
        // Structural sharing for better performance
        structuralSharing: true,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Singleton for browser, new instance per request on server
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create Query Client
 *
 * Server: Always create new instance per request
 * Browser: Reuse singleton instance
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

/**
 * Legacy Integration Wrapper
 *
 * Maintains compatibility with existing auth store and app integrations.
 * Will be removed in future refactor.
 */
function LegacyIntegrations({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const { trackPurchase } = useAppIntegrations();

  useEffect(() => {
    initialize();
    // Make tracking available globally for integration
    if (typeof window !== 'undefined') {
      (window as unknown as { trackPurchase: typeof trackPurchase }).trackPurchase = trackPurchase;
    }
  }, [initialize, trackPurchase]);

  return <>{children}</>;
}

/**
 * Providers Wrapper Component
 *
 * Provides context providers in optimal nesting order:
 * 1. Error Boundary (outermost - catches all errors)
 * 2. Query Client (data fetching with Keycloak auth)
 * 3. Theme Provider (appearance)
 * 4. Auth Provider (authentication state)
 * 5. Toast Provider (notifications - using sonner)
 * 6. Analytics Provider (tracking)
 *
 * Also includes:
 * - Screen reader announcements
 * - Network status indicator
 * - Cookie consent banner
 * - React Query DevTools (development only)
 * - Legacy integrations (backward compatibility)
 *
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export function Providers({ children }: ProvidersProps) {
  // Use a client-specific QueryClient in the browser, server gets a fresh one
  const [qc] = useState(() => getQueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="eshop-theme"
        >
          <NextAuthProvider>
            <AuthProvider>
              <LegacyIntegrations>
                <ToastProvider />
                <Suspense fallback={null}>
                  <AnalyticsProvider>
                    <ScreenReaderAnnouncer />
                    <NetworkStatus />

                    {children}

                    <Toaster position="top-right" richColors closeButton />

                    {process.env.NODE_ENV === 'development' && (
                      <ReactQueryDevtools initialIsOpen={false} />
                    )}
                  </AnalyticsProvider>
                </Suspense>
              </LegacyIntegrations>
            </AuthProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
