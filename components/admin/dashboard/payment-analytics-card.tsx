'use client';

import { BarChart3, TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/formatters';
import type { PaymentAnalytics } from '@/types/dashboard';

interface PaymentAnalyticsCardProps {
  analytics?: PaymentAnalytics;
  isLoading?: boolean;
}

export function PaymentAnalyticsCard({ analytics, isLoading }: PaymentAnalyticsCardProps) {
  if (isLoading || !analytics) {
    return <PaymentAnalyticsSkeleton />;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Payment Analytics
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Transaction performance overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Success Rate</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatPercentage(analytics.successRate)}
              </span>
              <span className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +1.2%
              </span>
            </div>
            <Progress value={analytics.successRate} className="h-1" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Total Volume</p>
            <div className="text-2xl font-bold">
              {formatCompactNumber(analytics.totalVolume)}
            </div>
             <p className="text-xs text-muted-foreground">
               {analytics.totalTransactions} transactions
             </p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Payment Methods</p>
          {analytics.methods.map((method) => (
            <div key={method.method} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  {method.displayName}
                </span>
                <span className="font-medium">
                    {formatPercentage(method.percentage)}
                </span>
              </div>
              <Progress value={method.percentage} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{method.transactions} txns</span>
                  <span>{formatCurrency(method.volume)}</span>
              </div>
            </div>
          ))}
        </div>
        
         <div className="rounded-lg bg-muted p-3 flex items-center gap-3">
             <div className="p-2 bg-background rounded-full shadow-sm">
                 <DollarSign className="h-4 w-4 text-primary" />
             </div>
             <div>
                 <p className="text-sm font-medium">Avg. Transaction</p>
                 <p className="text-xs text-muted-foreground">
                     {formatCurrency(analytics.averageTransactionValue)} per order
                 </p>
             </div>
         </div>
      </CardContent>
    </Card>
  );
}

function PaymentAnalyticsSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                 <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                 <div className="h-4 w-48 bg-muted rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                     <div className="h-16 bg-muted rounded animate-pulse" />
                     <div className="h-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                     <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                     <div className="h-10 bg-muted rounded animate-pulse" />
                     <div className="h-10 bg-muted rounded animate-pulse" />
                     <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
            </CardContent>
        </Card>
    )
}
