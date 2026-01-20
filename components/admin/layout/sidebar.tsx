'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Store,
  BarChart3,
  Settings,
  Boxes,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:view',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users:read',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: 'orders:read',
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    permission: 'products:read',
  },
  {
    title: 'Shops',
    href: '/admin/shops',
    icon: Store,
    permission: 'shops:read',
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes,
    permission: 'inventory:read',
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
    permission: 'payments:read',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'analytics:read',
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings:manage',
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const filteredBottomItems = bottomNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-y-auto">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t p-3 space-y-1">
          {filteredBottomItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}

          <div className="text-xs text-center text-muted-foreground opacity-50 pb-2 mt-2">
            v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
