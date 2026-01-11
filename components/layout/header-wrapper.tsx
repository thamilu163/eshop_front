'use client';

import dynamic from 'next/dynamic';
import PromotionalBanner from './promotional-banner';

/**
 * Client-side wrapper for Header component.
 * Uses dynamic import with ssr: false to prevent Radix UI hydration mismatches.
 *
 * This pattern is required in Next.js 16+ where dynamic() with ssr: false
 * must be called from a Client Component, not a Server Component.
 */
const Header = dynamic(() => import('./header'), {
  ssr: false,
  loading: () => (
    <>
      <div className="bg-muted h-10 animate-pulse" />
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          <div className="flex gap-4">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
          </div>
        </div>
      </header>
    </>
  ),
});

export default function HeaderWrapper() {
  return (
    <>
      <PromotionalBanner />
      <Header />
    </>
  );
}
