'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import { StatsCard } from '@/components/ui/stats-card';
import { useAdminDashboard } from '@/hooks/use-dashboard';
import { LoadingSpinner } from '@/components/ui/loading';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  // No redirect logic - middleware already protects this route
  // Just show loading state while data loads
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-6">
        <Sidebar />
        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Temporarily Unavailable</CardTitle>
              <CardDescription>
                Welcome{session?.user?.name ? `, ${session.user.name}` : ''}. The dashboard service is currently unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Backend API Error: {(error as any)?.message || 'Unable to connect to dashboard service'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please ensure the backend server is running at <code className="bg-muted px-2 py-1 rounded">http://localhost:8082</code>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Expected endpoint: <code className="bg-muted px-2 py-1 rounded">GET /api/v1/dashboard/admin</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Safe accessors to avoid runtime errors while data is undefined
  const overview = dashboardData?.overview;
  const userStats = dashboardData?.userStats;
  const totalUsers = overview?.totalUsers ?? 0;
  const totalOrders = overview?.totalOrders ?? 0;
  const totalRevenue = overview?.totalRevenue ?? 0;
  const pendingOrders = overview?.pendingOrders ?? 0;

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-6">
        <Sidebar />
        <main className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Users"
              value={totalUsers.toLocaleString()}
              description="Active accounts"
              trend={{ value: ((userStats?.newUsersThisMonth || 0) / (totalUsers || 1) * 100), isPositive: true }}
            />
            <StatsCard 
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              description="All time orders"
              trend={{ value: 8.3, isPositive: true }}
            />
            <StatsCard 
              title="Revenue"
              value={`$${((totalRevenue || 0) / 1000).toFixed(1)}k`}
              description="Total revenue"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard 
              title="Pending Orders"
              value={pendingOrders.toLocaleString()}
              description="Awaiting processing"
              trend={{ value: 2.1, isPositive: false }}
            />
          </div>
          
          {/* Enhanced Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">ORD-2024-1248</div>
                      <div className="text-sm text-muted-foreground">John Doe</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$299.99</div>
                      <div className="text-sm text-yellow-600">Processing</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">ORD-2024-1247</div>
                      <div className="text-sm text-muted-foreground">Jane Smith</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$149.99</div>
                      <div className="text-sm text-blue-600">Shipped</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">ORD-2024-1246</div>
                      <div className="text-sm text-muted-foreground">Bob Johnson</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$89.99</div>
                      <div className="text-sm text-green-600">Delivered</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>Transaction success rates and methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">97.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credit Cards</span>
                    <span className="text-sm text-muted-foreground">45% (562 trans.)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UPI Payments</span>
                    <span className="text-sm text-muted-foreground">30% (374 trans.)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Digital Wallets</span>
                    <span className="text-sm text-muted-foreground">15% (187 trans.)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EMI Options</span>
                    <span className="text-sm text-muted-foreground">10% (125 trans.)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Welcome{session?.user?.name ? `, ${session.user.name}` : ''}. Complete admin control
                  panel for e-commerce management.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => router.push('/admin/users')}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                    <div className="font-medium">User Management</div>
                    <div className="text-sm text-muted-foreground">{totalUsers.toLocaleString()} users</div>
                </div>
                <div 
                  onClick={() => router.push('/admin/orders')}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="font-medium">Order Processing</div>
                    <div className="text-sm text-muted-foreground">{totalOrders.toLocaleString()} orders</div>
                </div>
                <div 
                  onClick={() => router.push('/admin/products')}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="font-medium">Product Catalog</div>
                    <div className="text-sm text-muted-foreground">{(overview?.totalProducts ?? 0).toLocaleString()} products</div>
                </div>
                <div 
                  onClick={() => router.push('/admin/analytics')}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="font-medium">Shops</div>
                    <div className="text-sm text-muted-foreground">{(overview?.totalShops ?? 0).toLocaleString()} shops</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  );
}
