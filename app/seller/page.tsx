'use client';

import { useSession } from 'next-auth/react';
import { env } from '@/env';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Package,
  DollarSign,
  Sprout,
  ShoppingCart,
  Warehouse,
  PlusCircle,
  Archive,
  BarChart2,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface DashboardData {
  shopOverview: {
    shopName: string;
    shopStatus: string;
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    shopRating: number | null;
  };
  orderManagement: {
    newOrders: number;
    processingOrders: number;
    shippedOrders: number;
    completedOrders: number;
  };
  topProducts: Array<{
    productId: number;
    productName: string;
    currentPrice: number;
    category: string;
    stockQuantity: number;
  }>;
}

export default function SellerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  console.log('[Seller/Page] Component rendering');
  console.log('[Seller/Page] Session status:', status);
  console.log('[Seller/Page] User:', session?.user?.email);
  console.log('[Seller/Page] Roles:', session?.roles?.join(', '));

  useEffect(() => {
    console.log('[Seller/Page] useEffect running, status:', status);

    // Guard against loading or unauthenticated states (handled by SellerGuard, but keeping for safety in this local effect)
    if (status !== 'authenticated') return;

    // Check if we have access token
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      console.log('[Seller/Page] ❌ No access token available');
      setError('No access token available');
      setLoading(false);
      return;
    }

    // Make API call to backend using async/await with abort handling
    console.log('[Seller/Page] 🚀 Fetching dashboard from backend...');
    console.log('[Seller/Page] Token:', accessToken.substring(0, 30) + '...');
    console.log('[Seller/Page] API URL:', env.apiBaseUrl + '/api/v1/dashboard/seller');

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const res = await fetch(`${env.apiBaseUrl}/api/v1/dashboard/seller`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          signal,
        });

        console.log('[Seller/Page] 📡 Response status:', res.status);

        // Gracefully handle non-OK responses
        if (!res.ok) {
          let msg = `HTTP ${res.status}:${res.statusText ? ' ' + res.statusText : ''}`;
          try {
            const raw = await res.text();
            console.warn('[Seller/Page] Raw error body:', raw);
            const correlation =
              res.headers.get('x-correlation-id') || res.headers.get('x-correlation') || null;
            // Try to parse JSON error body
            let body: any = null;
            try {
              body = raw ? JSON.parse(raw) : null;
            } catch (e) {
              body = null;
            }

            if (body) {
              msg =
                body.detail ||
                body.message ||
                body.error ||
                body.title ||
                (body.errors ? JSON.stringify(body.errors) : msg) ||
                msg;
            } else if (raw) {
              msg = `${msg} ${raw.substring(0, 300)}`;
            }

            if (correlation) {
              msg = `${msg} (ref: ${correlation})`;
            }
          } catch (e) {
            // ignore parse errors
          }

          console.warn('[Seller/Page] API returned error:', msg);
          setError(msg);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('[Seller/Page] ✅ Dashboard data received:', data);
        setDashboard(data.data);
        setLoading(false);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.log('[Seller/Page] Fetch aborted');
          return;
        }
        console.error('[Seller/Page] ❌ API Error:', err);
        setError(err?.message || 'Failed to load dashboard');
        setLoading(false);
      }
    })();

    // Cleanup
    return () => controller.abort();
  }, [session, status, router, retryKey]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <Card className="border-2 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded bg-red-50 px-4 py-3 text-red-700">
                <strong>Error:</strong> {error}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    window.location.reload();
                  }}
                  className="rounded bg-blue-600 px-3 py-2 text-white"
                >
                  Retry (hard reload)
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                  }}
                  className="rounded border px-3 py-2"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="rounded border border-yellow-400 bg-yellow-50 px-4 py-3 text-yellow-700">
              Please log in to access the seller dashboard.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 md:px-6">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {dashboard?.shopOverview?.shopName && dashboard?.shopOverview?.shopName !== 'N/A'
                        ? dashboard.shopOverview.shopName
                        : session?.user?.name || 'Your Shop'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Welcome back, {session?.user?.name || session?.user?.email || 'Seller'}!
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(session?.roles as string[])
                    ?.filter((role) => !['offline_access', 'uma_authorization', 'default-roles-eshop'].includes(role))
                    .map((role) => (
                      <Badge key={role} className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-sm text-white">
                        {role}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">Total Products</span>
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-3xl font-bold">
                  {dashboard?.shopOverview?.totalProducts || 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">All products</p>
              </CardContent>
            </Card>
            <Card className="border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">Active Products</span>
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {dashboard?.shopOverview?.activeProducts || 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">Available for sale</p>
              </CardContent>
            </Card>
            <Card className="border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">Out of Stock</span>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {dashboard?.shopOverview?.outOfStockProducts || 0}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">Needs restocking</p>
              </CardContent>
            </Card>
            <Card className="border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">Shop Rating</span>
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-600">
                  {dashboard?.shopOverview?.shopRating
                    ? dashboard.shopOverview.shopRating.toFixed(1)
                    : 'N/A'}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">Customer rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Management */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Track your order status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded bg-blue-50 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard?.orderManagement?.newOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">New Orders</p>
                </div>
                <div className="rounded bg-yellow-50 p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboard?.orderManagement?.processingOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Processing</p>
                </div>
                <div className="rounded bg-purple-50 p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboard?.orderManagement?.shippedOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Shipped</p>
                </div>
                <div className="rounded bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard?.orderManagement?.completedOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your best performing items</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.topProducts && dashboard.topProducts.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.topProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between rounded bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{product.productName}</span>
                        <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Stock: {product.stockQuantity}
                        </span>
                        <span className="font-semibold text-green-600">
                          ${product.currentPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">No products found</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your shop and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: 'Add Product', icon: PlusCircle, path: '/seller/products/create' },
                  { label: 'View Orders', icon: Archive, path: '/seller/orders' },
                  { label: 'View Dashboard', icon: BarChart2, path: '/seller' },
                  { label: 'Shop Settings', icon: Settings, path: '/seller/settings' },
                ].map((action) => {
                  const Icon = action.icon as React.ElementType;
                  return (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.path)}
                      className="hover:border-primary hover:bg-accent flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all"
                    >
                      <Icon className="mb-2 h-8 w-8 text-purple-600" />
                      <div className="text-sm font-medium">{action.label}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
