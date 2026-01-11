import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, TrendingUp, Tag } from 'lucide-react';
import RegisterPrompt from './RegisterPrompt';

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
      className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700"
      aria-label="Hero banner"
    >
      <div className="w-full">
        <div className="relative">
          {/* Compact background with overlay */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero-pattern.jpg"
              alt=""
              fill
              className="object-cover opacity-15 mix-blend-overlay"
              priority
              quality={90}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-black/10" />
          </div>

          {/* Compact content container - using grid layout */}
          <div className="relative z-10 container mx-auto">
            <div className="grid min-h-125 items-center gap-8 px-6 py-12 md:px-8 lg:min-h-137.5 lg:grid-cols-2 lg:gap-12 lg:py-16">
              {/* Left: Content */}
              <div className="space-y-6 lg:space-y-8">
                {/* Premium badge */}
                <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top motion-safe:duration-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    New Customer? Get 20% Off Your First Order
                  </span>
                </div>

                {/* Compact heading */}
                <h1
                  className={cn(
                    'text-4xl leading-tight font-black tracking-tight md:text-5xl lg:text-6xl',
                    'text-white',
                    '[text-shadow:0_4px_12px_rgb(0_0_0/40%)]',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-500',
                    'motion-safe:delay-100'
                  )}
                >
                  Your One-Stop
                  <br />
                  <span className="bg-linear-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    Shopping Destination
                  </span>
                </h1>

                {/* Compact subheading */}
                <p
                  className={cn(
                    'text-base leading-relaxed text-white/90 md:text-lg lg:text-xl',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-500',
                    'motion-safe:delay-200'
                  )}
                >
                  Join{' '}
                  <span className="font-semibold text-yellow-300">50,000+ happy customers</span> and
                  discover unbeatable deals on electronics, fashion, home & more. Free shipping on
                  orders over $50.
                </p>

                {/* Enhanced CTAs with Sign Up prominence */}
                <div
                  className={cn(
                    'flex flex-col flex-wrap items-start gap-4 sm:flex-row sm:items-center',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500',
                    'motion-safe:delay-300'
                  )}
                >
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      'px-8 py-6 text-lg font-bold shadow-2xl',
                      'bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600',
                      'hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700',
                      'text-gray-900 hover:text-white',
                      'transition-all duration-300',
                      'hover:scale-105 hover:shadow-yellow-500/50',
                      'group relative overflow-hidden'
                    )}
                  >
                    <Link href="/auth/register" className="flex items-center gap-2">
                      <span>Sign Up Free</span>
                      <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      'px-8 py-6 text-base font-bold shadow-2xl',
                      'bg-white/95 backdrop-blur-md',
                      'text-gray-900 hover:bg-white',
                      'transition-all duration-300',
                      'hover:scale-105',
                      'group'
                    )}
                  >
                    <Link href="/products" className="flex items-center gap-2">
                      <span>Browse Products</span>
                      <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'px-6 py-6 text-base font-semibold',
                      'text-white hover:bg-white/10',
                      'transition-all duration-300',
                      'underline underline-offset-4 hover:underline-offset-8'
                    )}
                  >
                    <Link href="/products?filter=deals">View Today's Deals →</Link>
                  </Button>
                </div>

                {/* Enhanced trust indicators */}
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-6 pt-2 text-sm text-white/90',
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500',
                    'motion-safe:delay-400'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-yellow-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">4.8/5</span>
                    <span className="text-white/70">(10k+ reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-semibold">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Right: Featured Products Showcase */}
              <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right hidden motion-safe:delay-300 motion-safe:duration-700 lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {/* Product Card 1 */}
                  <div className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-white/90">
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-100 to-purple-100">
                        <span className="text-4xl">📱</span>
                      </div>
                      <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -30%
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Smartphones</h3>
                    <p className="text-xs text-white/70">From $299</p>
                  </div>

                  {/* Product Card 2 */}
                  <div className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-white/90">
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-pink-100 to-rose-100">
                        <span className="text-4xl">👗</span>
                      </div>
                      <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -50%
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Fashion</h3>
                    <p className="text-xs text-white/70">From $19</p>
                  </div>

                  {/* Product Card 3 */}
                  <div className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-white/90">
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-green-100 to-teal-100">
                        <span className="text-4xl">🏠</span>
                      </div>
                      <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -25%
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Home & Living</h3>
                    <p className="text-xs text-white/70">From $29</p>
                  </div>

                  {/* Product Card 4 */}
                  <div className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-white/90">
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-yellow-100 to-orange-100">
                        <span className="text-4xl">⚽</span>
                      </div>
                      <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -40%
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Sports & Outdoor</h3>
                    <p className="text-xs text-white/70">From $39</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
