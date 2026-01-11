/**
 * Site Configuration
 *
 * Centralized configuration for application metadata, SEO, and branding.
 * Uses Zod for runtime validation to catch configuration errors early.
 *
 * @module lib/config/site
 */

import { z } from 'zod';

// Schema for site configuration validation
const SiteConfigSchema = z.object({
  name: z.string().min(1, 'Site name is required'),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  url: z.string().url('Must be a valid URL'),
  ogImage: z.string().min(1, 'OG image path is required'),
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    url: z.string().url('Author URL must be valid'),
    email: z.string().email('Must be a valid email'),
  }),
  keywords: z.array(z.string()).min(1, 'At least one keyword required'),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/, 'Locale must be in format: en-US'),
  twitterHandle: z
    .string()
    .regex(/^@[a-zA-Z0-9_]{1,15}$/)
    .optional(),
  links: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

/**
 * Creates and validates site configuration
 *
 * Configuration is loaded from environment variables with fallbacks.
 * Throws if configuration is invalid to prevent runtime issues.
 *
 * @returns Validated site configuration
 * @throws {ZodError} If configuration is invalid
 */
function createSiteConfig(): SiteConfig {
  const config = {
    name: 'eShop - Enterprise E-commerce Platform',
    description:
      'Complete enterprise e-commerce platform with shopping cart, wishlist, analytics, and admin dashboard. Built with Next.js, TypeScript, and Tailwind CSS for maximum performance and scalability.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ogImage: '/og-image.png',
    author: {
      name: 'eShop Team',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      email: 'team@eshop.com',
    },
    keywords: [
      'ecommerce',
      'shopping',
      'online store',
      'cart',
      'wishlist',
      'products',
      'analytics',
      'admin dashboard',
      'next.js',
      'react',
      'typescript',
      'tailwind',
      'enterprise',
    ],
    locale: 'en-US',
    twitterHandle: '@eshop',
    links: {
      twitter: 'https://twitter.com/eshop',
      github: 'https://github.com/eshop',
      linkedin: 'https://linkedin.com/company/eshop',
    },
  };

  // Validate and return configuration
  try {
    return SiteConfigSchema.parse(config);
  } catch (error) {
    console.error('❌ Invalid site configuration:', error);
    throw new Error('Site configuration validation failed. Check console for details.');
  }
}

/**
 * Validated site configuration singleton
 *
 * Use this throughout the application for consistent metadata.
 */
export const siteConfig = createSiteConfig();

/**
 * Navigation items configuration
 */
export const navigationConfig = {
  main: [
    { title: 'Home', href: '/' },
    { title: 'Products', href: '/products' },
    { title: 'About', href: '/about' },
    { title: 'Contact', href: '/contact' },
  ],
  customer: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/orders' },
    { title: 'Wishlist', href: '/wishlist' },
    { title: 'Cart', href: '/cart' },
    { title: 'Settings', href: '/settings' },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Analytics', href: '/analytics' },
  ],
  seller: [
    { title: 'Dashboard', href: '/seller' },
    { title: 'My Products', href: '/seller/products' },
    { title: 'Orders', href: '/seller/orders' },
  ],
  footer: [
    {
      title: 'Company',
      items: [
        { title: 'About Us', href: '/about' },
        { title: 'Careers', href: '/careers' },
        { title: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      items: [
        { title: 'Help Center', href: '/help' },
        { title: 'Contact Us', href: '/contact' },
        { title: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { title: 'Privacy Policy', href: '/privacy' },
        { title: 'Terms of Service', href: '/terms' },
        { title: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ],
} as const;

/**
 * Social media configuration
 */
export const socialConfig = {
  twitter: {
    handle: '@eshop',
    url: 'https://twitter.com/eshop',
  },
  github: {
    url: 'https://github.com/eshop',
  },
  linkedin: {
    url: 'https://linkedin.com/company/eshop',
  },
} as const;
