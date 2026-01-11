'use client';

import Link from 'next/link';
import { ChevronRight, Smartphone, Home, Watch, Gamepad2, Shirt, Dumbbell } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

interface Category {
  name: string;
  href: string;
  icon: React.ReactNode;
  subcategories?: { name: string; href: string }[];
}

const categories: Category[] = [
  {
    name: 'Electronics',
    href: '/categories/electronics',
    icon: <Smartphone className="h-5 w-5" />,
    subcategories: [
      { name: 'Smartphones', href: '/categories/electronics/smartphones' },
      { name: 'Laptops', href: '/categories/electronics/laptops' },
      { name: 'Tablets', href: '/categories/electronics/tablets' },
      { name: 'Accessories', href: '/categories/electronics/accessories' },
    ],
  },
  {
    name: 'Fashion',
    href: '/categories/fashion',
    icon: <Shirt className="h-5 w-5" />,
    subcategories: [
      { name: "Men's Clothing", href: '/categories/fashion/mens' },
      { name: "Women's Clothing", href: '/categories/fashion/womens' },
      { name: 'Kids', href: '/categories/fashion/kids' },
      { name: 'Shoes', href: '/categories/fashion/shoes' },
    ],
  },
  {
    name: 'Home & Living',
    href: '/categories/home',
    icon: <Home className="h-5 w-5" />,
    subcategories: [
      { name: 'Furniture', href: '/categories/home/furniture' },
      { name: 'Kitchen', href: '/categories/home/kitchen' },
      { name: 'Decor', href: '/categories/home/decor' },
      { name: 'Bedding', href: '/categories/home/bedding' },
    ],
  },
  {
    name: 'Sports',
    href: '/categories/sports',
    icon: <Dumbbell className="h-5 w-5" />,
    subcategories: [
      { name: 'Fitness Equipment', href: '/categories/sports/fitness' },
      { name: 'Outdoor Gear', href: '/categories/sports/outdoor' },
      { name: 'Team Sports', href: '/categories/sports/team' },
      { name: 'Activewear', href: '/categories/sports/activewear' },
    ],
  },
];

/**
 * Category Mega Menu Component
 * Enterprise standard: Category navigation with subcategories
 */
export default function CategoryMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9">All Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-200 p-4">
              <div className="grid grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-3">
                    <Link
                      href={category.href}
                      className="hover:text-primary group flex items-center gap-2 text-sm font-semibold transition-colors"
                    >
                      {category.icon}
                      <span>{category.name}</span>
                      <ChevronRight className="-ml-1 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                    </Link>
                    {category.subcategories && (
                      <ul className="space-y-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className="text-muted-foreground hover:text-foreground block text-sm transition-colors hover:underline"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4">
                <Link
                  href="/categories"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All Categories →
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
