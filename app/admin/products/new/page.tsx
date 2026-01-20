'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';

export default function AdminNewProductPage() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = usePermissions();
  const router = useRouter();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
        router.push('/auth/login');
        return;
    }
    
    if (!isAdmin) {
        // If authenticated but not admin, redirect to dashboard instead of login
        router.push('/admin/dashboard');
        return;
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if not admin (will redirect)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Create a new product in the catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Product creation form coming soon.</p>
          </CardContent>
        </Card>
    </>
  );
}
