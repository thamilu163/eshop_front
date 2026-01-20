'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useStoreExists } from '@/hooks/queries/use-seller';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SellerGuardProps {
  children: React.ReactNode;
}

/**
 * SellerGuard - Centralized route protection for sellers
 * Enforces that a user has a completed seller profile/store before accessing seller tools.
 */
export function SellerGuard({ children }: SellerGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: storeExists, isLoading, isError, error } = useStoreExists();

  const isAuthLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';
  const roles = (session?.roles || []) as string[];
  const isSeller = roles.includes('SELLER');
  const isOnboardPath = pathname === '/seller/onboard';

  useEffect(() => {
    if (!isAuthLoading && isUnauthenticated) {
      router.push('/login');
    } else if (!isAuthLoading && !isSeller) {
      router.push('/');
    }
  }, [isAuthLoading, isUnauthenticated, isSeller, router]);

  // If we're on the onboarding page, don't block (otherwise we get infinite loops)
  if (isOnboardPath) {
    return <>{children}</>;
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse font-medium">Verifying seller status...</p>
      </div>
    );
  }

  // Handle specific error cases that should be treated as "no store yet"
  const isProfileMissingError = isError && 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((error as any)?.status === 404 || 
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     (error as any)?.status === 403 || 
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     (error as any)?.message?.includes('not found') ||
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     (error as any)?.message?.includes('not a seller'));

  if (isError && !isProfileMissingError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 text-red-900 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle className="text-lg">Validation Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm font-medium">Failed to verify your seller profile. Please try again later.</p>
            {error && (
              <p className="mb-4 text-xs opacity-70 bg-red-100/50 p-2 rounded">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                Ref: {(error as any).message}
              </p>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If store doesn't exist (or we got a "not found" error), show onboarding prompt
  if (storeExists === false || isProfileMissingError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="border-2 border-blue-500 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-700">Complete Your Profile</CardTitle>
                <CardDescription className="text-base text-blue-600/80">
                  Enable your selling capabilities to proceed
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
              <p className="font-medium">
                You're almost ready to start selling!
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                To access the dashboard, list products, and manage orders, you first need to set up your seller profile. This only takes a minute.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/seller/onboard">Complete Seller Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile exists and user is authenticated as seller
  return <>{children}</>;
}
