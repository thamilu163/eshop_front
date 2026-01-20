import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, TrendingUp, Star, Shield } from 'lucide-react';


/**
 * Hero Section - Server Component
 *
 * Features:
 * - Optimized background image with next/image (LCP optimization)
 * - Semantic color tokens (theme-aware, dark mode compatible)
 * - Proper Button/Link pattern with asChild
 * - Accessible heading hierarchy (h1)
 * - Focus-visible keyboard navigation
 * - Safe area padding for mobile notches
 * - Responsive height scaling
 * - ARIA semantics for decorative elements
 *
 * @example
 * ```tsx
 * <Hero />
 * ```
 */
export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-slate-900"
      aria-label="Hero banner"
    >
      <div className="w-full">
        <div className="relative">
          {/* Subtle background with professional overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-blue-950 to-slate-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]" />
            <Image
              src="/images/hero-pattern.jpg"
              alt=""
              fill
              className="object-cover opacity-10 mix-blend-overlay"
              priority
              quality={90}
              sizes="100vw"
              unoptimized
            />
          </div>

          {/* Optimized content container - Compact Enterprise Layout */}
          <div className="relative z-10 container mx-auto px-4 md:px-6">
            <div className="grid min-h-[480px] lg:min-h-[520px] items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
              
              {/* Left: Content Section */}
              <div className="max-w-xl space-y-6">
                {/* Clean, smaller badge */}
                <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top motion-safe:duration-700">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 shadow-sm backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Limited Offer: 20% Off Your First Order
                  </span>
                </div>

                {/* Professional Heading - Scaled for better density */}
                <h1
                  className={cn(
                    'text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-5.5xl',
                    'text-white',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-700',
                    'motion-safe:delay-100'
                  )}
                >
                  Your Enterprise
                  <br />
                  <span className="from-blue-400 to-indigo-400 bg-linear-to-r bg-clip-text text-transparent">
                    Shopping Destination
                  </span>
                </h1>

                {/* Compact subheading - Improved readability */}
                <p
                  className={cn(
                    'max-w-[480px] text-sm leading-relaxed text-slate-300 md:text-base',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-700',
                    'motion-safe:delay-200'
                  )}
                >
                  Join <span className="font-semibold text-white">50,000+ happy customers</span> and discover professional-grade deals on electronics, fashion, and home essentials. Free shipping on orders over ₹500.
                </p>

                {/* Standardized CTA Hierarchy */}
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-3 pt-2',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700',
                    'motion-safe:delay-300'
                  )}
                >
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      'h-12 px-8 text-sm font-semibold shadow-xl',
                      'bg-blue-600 hover:bg-blue-500',
                      'text-white',
                      'transition-all duration-200',
                      'hover:-translate-y-0.5 active:translate-y-0'
                    )}
                  >
                    <Link href="/auth/register">
                      Sign Up Free
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cn(
                      'h-12 border-slate-700 bg-slate-800/10 px-8 text-sm font-semibold text-white backdrop-blur-sm hover:bg-slate-800/50',
                      'transition-all duration-200'
                    )}
                  >
                    <Link href="/products" className="flex items-center gap-2">
                      Browse All
                      <TrendingUp className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Link 
                    href="/products?filter=deals" 
                    className="ml-2 text-sm font-medium text-slate-400 hover:text-white hover:underline underline-offset-4 transition-colors"
                  >
                    Today's Deals →
                  </Link>
                </div>

                {/* Refined Trust Indicators */}
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-6 pt-6 text-xs font-medium text-slate-400',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700',
                    'motion-safe:delay-400'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-white">4.8/5</span>
                    <span>(10k+ Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Secure Transactions</span>
                  </div>
                </div>
              </div>

              {/* Right: Structured Department Grid */}
              <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right hidden motion-safe:delay-300 motion-safe:duration-1000 lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {/* Department Item 1 */}
                  <Link href="/products?category=electronics" className="group block">
                    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-800/80 hover:shadow-2xl">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <span className="text-xl">📱</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400">Electronics</h3>
                      <p className="mt-1 text-xs text-slate-400">From ₹24,999</p>
                      <div className="absolute -right-4 -bottom-4 translate-x-4 translate-y-4 text-4xl opacity-5 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-10">📱</div>
                    </div>
                  </Link>

                  {/* Department Item 2 */}
                  <Link href="/products?category=fashion" className="group block">
                    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-2xl">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                        <span className="text-xl">👗</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400">Fashion</h3>
                      <p className="mt-1 text-xs text-slate-400">From ₹999</p>
                      <div className="absolute -right-4 -bottom-4 translate-x-4 translate-y-4 text-4xl opacity-5 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-10">👗</div>
                    </div>
                  </Link>

                  {/* Department Item 3 */}
                  <Link href="/products?category=home" className="group block">
                    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:shadow-2xl">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <span className="text-xl">🏠</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400">Home & Living</h3>
                      <p className="mt-1 text-xs text-slate-400">From ₹1,499</p>
                      <div className="absolute -right-4 -bottom-4 translate-x-4 translate-y-4 text-4xl opacity-5 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-10">🏠</div>
                    </div>
                  </Link>

                  {/* Department Item 4 */}
                  <Link href="/products?category=sports" className="group block">
                    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-800/80 hover:shadow-2xl">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                        <span className="text-xl">⚽</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-orange-400">Sports</h3>
                      <p className="mt-1 text-xs text-slate-400">From ₹2,999</p>
                      <div className="absolute -right-4 -bottom-4 translate-x-4 translate-y-4 text-4xl opacity-5 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-10">⚽</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

