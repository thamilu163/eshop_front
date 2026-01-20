'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { ThemeToggle } from '@/components/theme-toggle'; 

export function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile Menu Toggle - visible on small screens */}
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="font-bold text-xl tracking-tight hidden md:block">
            EShop Admin
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, products, customers..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
