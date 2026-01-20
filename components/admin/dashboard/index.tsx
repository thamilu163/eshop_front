'use client';

import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { DashboardHeader } from './dashboard-header';
import { StatsCards } from './stats-cards';
import { RecentOrdersCard } from './recent-orders-card';
import { QuickActions } from './quick-actions';
import { NavigationCards } from './navigation-cards';
import { PaymentAnalyticsCard } from './payment-analytics-card';
import { AlertsCard } from './alerts-card';
import { InventoryAlertsCard } from './inventory-alerts-card';
import { DashboardSkeleton } from './skeleton';
import { DashboardError } from './error';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from '@/types/dashboard';

export function AdminDashboard() {
  const [dateRange] = useState<DateRange>({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
      preset: 'last30days'
  });

  const { data, isLoading, isError, error, refresh, lastUpdated } = useAdminDashboard({
      dateRange
  });

  if (isError) {
    return <DashboardError error={error} onRetry={refresh} />;
  }

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Dashboard"
        description="Overview of your store's performance"
        lastUpdated={lastUpdated}
        isFetching={isLoading}
      >
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DashboardHeader>

      <StatsCards 
        overview={data?.overview} 
        userStats={data?.userStats}
        isLoading={isLoading} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        {/* Main Feed - Left Column */}
        <div className="lg:col-span-4 space-y-6">
            <RecentOrdersCard 
                orders={data?.recentOrders || []} 
                isLoading={isLoading}
            />
            <NavigationCards overview={data?.overview} />
        </div>

        {/* Sidebar - Right Column */}
        <div className="lg:col-span-3 space-y-6">
            <QuickActions onRefresh={refresh} />
            <PaymentAnalyticsCard 
                analytics={data?.paymentAnalytics}
                isLoading={isLoading}
            />
            <AlertsCard 
                alerts={data?.alerts || []}
                isLoading={isLoading}
            />
            <InventoryAlertsCard 
                alerts={data?.inventoryAlerts || []}
                isLoading={isLoading}
            />
        </div>
      </div>
    </div>
  );
}
