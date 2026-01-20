'use client';

import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
// import { cn } from '@/lib/utils'; // Not used in provided snippet but good practice
import type { RecentOrder, OrderStatus } from '@/types/dashboard';

interface RecentOrdersCardProps {
  orders: RecentOrder[];
  isLoading?: boolean;
  maxItems?: number;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PROCESSING: { label: 'Processing', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'default' },
  DELIVERED: { label: 'Delivered', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'outline' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function RecentOrdersCard({
  orders,
  isLoading,
  maxItems = 5,
}: RecentOrdersCardProps) {
  if (isLoading) {
    return <RecentOrdersCardSkeleton />;
  }

  const displayOrders = orders.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Latest customer orders requiring attention
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {displayOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrderItem({ order }: { order: RecentOrder }) {
  const config = statusConfig[order.status] || { label: order.status, variant: 'secondary' };
  const initials = order.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={order.customerAvatar} alt={order.customerName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium group-hover:text-primary transition-colors">
            {order.orderNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            {order.customerName} • {order.itemCount} items
          </div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(order.createdAt)}
          </div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="font-semibold">
          {formatCurrency(order.amount, order.currency)}
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">No recent orders</p>
      <p className="text-sm text-muted-foreground">
        Orders will appear here when customers place them
      </p>
    </div>
  );
}

function RecentOrdersCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
