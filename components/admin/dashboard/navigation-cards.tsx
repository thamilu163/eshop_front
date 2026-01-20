'use client';

import Link from 'next/link';
import {
  Users,
  ShoppingCart,
  Package,
  Store,
  BarChart3,
  Settings,
  Boxes,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCompactNumber } from '@/lib/formatters';
import type { DashboardOverview } from '@/types/dashboard';

interface NavigationCardsProps {
  overview?: DashboardOverview;
}

interface NavCard {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  value?: number;
  color: string;
}

export function NavigationCards({ overview }: NavigationCardsProps) {
  const cards: NavCard[] = [
    {
      href: '/admin/users',
      icon: Users,
      title: 'User Management',
      description: 'Manage customers and staff',
      value: overview?.totalUsers,
      color: 'text-blue-600',
    },
    {
      href: '/admin/orders',
      icon: ShoppingCart,
      title: 'Order Processing',
      description: 'View and manage orders',
      value: overview?.totalOrders,
      color: 'text-green-600',
    },
    {
      href: '/admin/products',
      icon: Package,
      title: 'Product Catalog',
      description: 'Manage your products',
      value: overview?.totalProducts,
      color: 'text-purple-600',
    },
    {
      href: '/admin/shops',
      icon: Store,
      title: 'Shop Management',
      description: 'Manage seller shops',
      value: overview?.totalShops,
      color: 'text-orange-600',
    },
    {
      href: '/admin/inventory',
      icon: Boxes,
      title: 'Inventory',
      description: 'Stock management',
      value: undefined,
      color: 'text-yellow-600',
    },
    {
      href: '/admin/analytics',
      icon: BarChart3,
      title: 'Analytics',
      description: 'Reports and insights',
      value: undefined,
      color: 'text-pink-600',
    },
    {
      href: '/admin/payments',
      icon: CreditCard,
      title: 'Payments',
      description: 'Transaction history',
      value: undefined,
      color: 'text-teal-600',
    },
    {
      href: '/admin/settings',
      icon: Settings,
      title: 'Settings',
      description: 'System configuration',
      value: undefined,
      color: 'text-gray-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Navigation</CardTitle>
        <CardDescription>Access all management sections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <NavCardItem key={card.href} {...card} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NavCardItem({ href, icon: Icon, title, description, value, color }: NavCard) {
  return (
    <Link
      href={href}
      className="group flex flex-col p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all"
    >
      <div className={`${color} mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="font-medium group-hover:text-primary transition-colors">
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
      {value !== undefined && (
        <div className="mt-2 text-lg font-semibold">
          {formatCompactNumber(value)}
        </div>
      )}
    </Link>
  );
}
