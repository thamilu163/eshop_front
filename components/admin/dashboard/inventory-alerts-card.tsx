'use client';

import { Boxes, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { formatCompactNumber } from '@/lib/formatters';
import type { InventoryAlert } from '@/types/dashboard';

interface InventoryAlertsCardProps {
  alerts: InventoryAlert[];
  isLoading?: boolean;
}

export function InventoryAlertsCard({ alerts, isLoading }: InventoryAlertsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products requiring restock</CardDescription>
        </div>
        <Badge variant={alerts.length > 0 ? "destructive" : "secondary"}>
          {alerts.length} Issues
        </Badge>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No inventory alerts at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{alert.productName}</p>
                    <p className="text-xs text-muted-foreground">
                        SKU: {alert.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold {alert.currentStock === 0 ? 'text-destructive' : 'text-orange-600'}">
                    {alert.currentStock} left
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Threshold: {alert.threshold}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/inventory">View All Inventory</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
