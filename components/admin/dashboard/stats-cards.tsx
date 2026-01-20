'use client';

import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { DashboardOverview, UserStats } from '@/types/dashboard';

interface StatsCardsProps {
  overview?: DashboardOverview;
  userStats?: UserStats;
  isLoading?: boolean;
}

interface StatCardData {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

export function StatsCards({ overview, userStats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const userGrowthRate = userStats
    ? ((userStats.newUsersThisMonth - userStats.newUsersLastMonth) /
        (userStats.newUsersLastMonth || 1)) *
      100
    : 0;

  const stats: StatCardData[] = [
    {
      title: 'Total Users',
      value: formatCompactNumber(overview?.totalUsers ?? 0),
      description: `${formatCompactNumber(userStats?.activeUsers ?? 0)} active`,
      icon: Users,
      trend: {
        value: Math.abs(userGrowthRate),
        isPositive: userGrowthRate >= 0,
        label: 'vs last month',
      },
    },
    {
      title: 'Total Orders',
      value: formatCompactNumber(overview?.totalOrders ?? 0),
      description: `${formatCompactNumber(overview?.completedOrders ?? 0)} completed`,
      icon: ShoppingCart,
      trend: {
        value: 8.3,
        isPositive: true,
        label: 'vs last month',
      },
    },
    {
      title: 'Revenue',
      value: formatCurrency(overview?.totalRevenue ?? 0),
      description: `Avg ${formatCurrency(overview?.averageOrderValue ?? 0)}/order`,
      icon: DollarSign,
      trend: {
        value: 12.5,
        isPositive: true,
        label: 'vs last month',
      },
    },
    {
      title: 'Pending Orders',
      value: formatCompactNumber(overview?.pendingOrders ?? 0),
      description: 'Awaiting processing',
      icon: Package,
      trend: {
        value: 2.1,
        isPositive: false,
        label: 'needs attention',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardData) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div
              className={cn(
                'flex items-center text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {formatPercentage(trend.value)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
