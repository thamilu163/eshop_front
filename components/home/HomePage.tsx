import React from 'react';
import QuickLinksBanner from './QuickLinksBanner.wrapper';
import Hero from './Hero';
import { CategorySection } from './CategorySection';
import { FlashDealsSection } from './FlashDealsSection';
import { PromoBannerSection } from './PromoBannerSection';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import FeaturedSlider from './FeaturedSlider';
import PromoBanners from './PromoBanners';
import TrustSection from './TrustSection';
import { TestimonialsSection } from './TestimonialsSection';
import { AppDownloadSection } from './AppDownloadSection';
import {
  FlashDealsSkeleton,
  FeaturedProductsSkeleton,
  TestimonialsSkeleton,
  AppDownloadSkeleton,
  HeroSkeleton,
  CategorySkeleton,
  PromoBannerSkeleton,
  QuickLinksSkeleton,
  FeaturedSliderSkeleton,
  PromoBannersSkeleton,
  TrustSkeleton,
} from './skeletons';
import { 
  FlashDealsError, 
  FeaturedProductsError,
  TestimonialsError,
  AppDownloadError,
  SectionErrorFallback 
} from './error-fallbacks';
import { ResilientSection } from '@/components/common/resilient-section';

/**
 * Enterprise Home Page Component
 * 
 * Architecture Notes:
 * - Server Component with streaming SSR for optimal Core Web Vitals
 * - ResilientSection provides error boundaries + Suspense for each section
 * - Async Server Components trigger Suspense boundaries during data fetching
 * - No manual dynamic() imports—rely on natural code splitting + Suspense
 * - Header should be in app/layout.tsx for persistent state across routes
 * 
 * Performance Strategy:
 * - Above-fold sections: Render immediately (Hero, QuickLinks, Categories)
 * - Data-driven sections: Stream progressively (Flash Deals, Featured Products)
 * - Below-fold sections: Load naturally with Suspense (no ssr: false)
 * 
 * @example
 * ```tsx
 * // In app/page.tsx:
 * import HomePage from '@/components/home/HomePage';
 * export default function Page() {
 *   return <HomePage />;
 * }
 * ```
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main id="main-content" aria-label="Home page content" className="min-h-dvh">
      {/* Skip navigation for keyboard/screen reader users (WCAG 2.1) */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
                   focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      {/* SEO: Primary heading for document outline */}
      <h1 className="sr-only">eShop - Online Shopping</h1>
      
      {/* Live region for dynamic content announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="loading-announcer"
      />
      
      {/* ===== ABOVE THE FOLD ===== */}
      {/* Critical path rendering - no data fetching, static/minimal JS */}
      
      <ResilientSection
        fallback={<SectionErrorFallback section="hero" />}
        skeleton={<HeroSkeleton />}
      >
        <Hero />
      </ResilientSection>

      <ResilientSection
        fallback={<SectionErrorFallback section="quick links" />}
        skeleton={<QuickLinksSkeleton />}
      >
        <QuickLinksBanner />
      </ResilientSection>
      
      {/* ===== PRIMARY CONTENT ===== */}
      {/* First meaningful content after hero */}
      
      <ResilientSection
        fallback={<SectionErrorFallback section="categories" />}
        skeleton={<CategorySkeleton />}
      >
        <CategorySection />
      </ResilientSection>
      
      {/* ===== DATA-DRIVEN SECTIONS ===== */}
      {/* Async Server Components - trigger Suspense during fetch */}
      
      <ResilientSection
        fallback={<FlashDealsError />}
        skeleton={<FlashDealsSkeleton />}
      >
        <FlashDealsSection />
      </ResilientSection>
      
      <ResilientSection
        fallback={<SectionErrorFallback section="promotional banner" />}
        skeleton={<PromoBannerSkeleton />}
      >
        <PromoBannerSection />
      </ResilientSection>
      
      <ResilientSection
        fallback={<FeaturedProductsError />}
        skeleton={<FeaturedProductsSkeleton />}
      >
        <FeaturedProductsSection />
      </ResilientSection>
      
      {/* ===== BELOW THE FOLD ===== */}
      {/* Loaded naturally with Suspense - no manual ssr: false needed */}
      
      <ResilientSection
        fallback={<TestimonialsError />}
        skeleton={<TestimonialsSkeleton />}
      >
        <TestimonialsSection />
      </ResilientSection>

      <ResilientSection
        fallback={<SectionErrorFallback section="featured slider" />}
        skeleton={<FeaturedSliderSkeleton />}
      >
        <FeaturedSlider />
      </ResilientSection>

      <ResilientSection
        fallback={<SectionErrorFallback section="promo banners" />}
        skeleton={<PromoBannersSkeleton />}
      >
        <PromoBanners />
      </ResilientSection>

      <ResilientSection
        fallback={<SectionErrorFallback section="trust" />}
        skeleton={<TrustSkeleton />}
      >
        <TrustSection />
      </ResilientSection>

      <ResilientSection
        fallback={<AppDownloadError />}
        skeleton={<AppDownloadSkeleton />}
      >
        <AppDownloadSection />
      </ResilientSection>
    </main>
  );
}
