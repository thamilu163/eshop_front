import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Timer, Flame } from 'lucide-react';
import { flashDeals as staticFlashDeals } from '@/constants';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Flash deal product data structure
 * Align with backend DTOs where possible
 */
interface FlashDeal {
  id: number | string;
  image: string;
  title: string;
  description?: string;
  price: number;
  oldPrice?: number;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format price with locale-aware currency display
 */
const formatPrice = (price: number, locale = 'en-US', currency = 'USD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);

/**
 * Calculate discount percentage for flash deals
 */
function getDiscountPercentage(price: number, oldPrice?: number): number | null {
  if (typeof oldPrice !== 'number' || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

// ============================================================================
// Component
// ============================================================================

/**
 * FlashDealsSection - Server Component
 * 
 * Features:
 * - Server Component (async ready for data fetching)
 * - Single interactive link per card (WCAG compliant)
 * - Optimized images with next/image
 * - Discount badges for visual urgency
 * - Accessible price context for screen readers
 * - Empty state handling
 * - Semantic color tokens (theme-aware)
 * - Focus-visible keyboard navigation
 * 
 * @example
 * ```tsx
 * <FlashDealsSection />
 * // Or wrap in Suspense for streaming:
 * <Suspense fallback={<FlashDealsSkeleton />}>
 *   <FlashDealsSection />
 * </Suspense>
 * ```
 */
export async function FlashDealsSection() {
  // TODO: Replace with real server fetch
  // const flashDeals = await getFlashDeals();
  const flashDeals: FlashDeal[] = staticFlashDeals as FlashDeal[];

  // Empty state handling
  if (!flashDeals || flashDeals.length === 0) {
    return (
      <section className="py-16" aria-labelledby="flash-deals-heading">
        <div className="container mx-auto px-4 md:px-6">
          <h2 id="flash-deals-heading" className="text-3xl font-bold mb-2">
            Flash Deals
          </h2>
          <p className="text-muted-foreground mb-8">
            Limited time offers. Grab them fast!
          </p>
          <div className="text-center py-12 text-muted-foreground">
            <p>No flash deals available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" aria-labelledby="flash-deals-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 id="flash-deals-heading" className="text-3xl md:text-4xl font-bold">
                Flash Deals
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                <Flame className="w-4 h-4" />
                HOT
              </span>
            </div>
            <p className="text-base md:text-lg text-muted-foreground flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-500" />
              Limited time offers. Grab them fast!
            </p>
          </div>

          {/* Desktop View All */}
          <Link
            href="/products"
            className={cn(
              "hidden md:inline-flex items-center gap-2",
              "text-sm font-medium text-muted-foreground",
              "hover:text-foreground hover:bg-accent",
              "px-3 py-2 rounded transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="View all flash deals"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid with list semantics for screen readers */}
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {flashDeals.map((deal: FlashDeal, index) => {
            const discount = getDiscountPercentage(deal.price, deal.oldPrice);
            const savings = deal.oldPrice ? deal.oldPrice - deal.price : 0;
            
            return (
              <li key={deal.id} className="group relative">
                <Link
                  href={`/products/${deal.id}`}
                  className={cn(
                    "block rounded-lg",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  aria-label={`${deal.title}, ${formatPrice(deal.price)}${
                    deal.oldPrice
                      ? `, was ${formatPrice(deal.oldPrice)}, save ${formatPrice(savings)}`
                      : ''
                  }`}
                >
                  <Card
                    className={cn(
                      "h-full overflow-hidden transition-all duration-300",
                      "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                      "rounded-xl",
                      "hover:shadow-2xl hover:border-primary hover:-translate-y-1",
                      "active:scale-[0.98] touch-manipulation"
                    )}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      {/* Discount badge */}
                      {discount && (
                        <span
                          className={cn(
                            "absolute top-3 right-3 z-10",
                            "bg-gradient-to-r from-red-500 to-red-600",
                            "text-white text-xs font-bold px-3 py-1.5 rounded-full",
                            "shadow-lg shadow-red-500/50",
                            "animate-pulse"
                          )}
                          aria-hidden="true"
                        >
                          -{discount}%
                        </span>
                      )}

                      {/* Product image with overflow containment */}
                      <div className="relative aspect-square w-32 md:w-36 mb-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={deal.image}
                          alt=""
                          fill
                          className={cn(
                            "object-cover transition-transform duration-500",
                            "[@media(hover:hover)]:group-hover:scale-110"
                          )}
                          sizes="(max-width: 640px) 128px, 144px"
                          priority={index < 4}
                        />
                      </div>

                      {/* Product title */}
                      <h3
                        className={cn(
                          "font-bold text-lg mb-1 text-center",
                          "group-hover:text-primary transition-colors"
                        )}
                      >
                        {deal.title}
                      </h3>

                      {/* Description */}
                      {deal.description && (
                        <p className="text-sm text-muted-foreground mb-2 text-center line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      {/* Pricing with accessible context */}
                      <div
                        className="flex items-center gap-2 mb-3"
                        role="group"
                        aria-label="Pricing"
                      >
                        <span className="text-xl font-bold text-primary">
                          <span className="sr-only">Current price: </span>
                          {formatPrice(deal.price)}
                        </span>
                        {typeof deal.oldPrice === 'number' && (
                          <>
                            <span
                              className="text-sm line-through text-muted-foreground"
                              aria-hidden="true"
                            >
                              {formatPrice(deal.oldPrice)}
                            </span>
                            <span className="sr-only">
                              Original price: {formatPrice(deal.oldPrice)}, you
                              save {formatPrice(savings)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Visual CTA (not a separate link) */}
                      <span
                        className={cn(
                          "w-full text-center py-3 rounded-lg",
                          "text-sm font-bold transition-all duration-300",
                          "bg-gradient-to-r from-primary to-primary/80",
                          "text-primary-foreground",
                          "group-hover:from-primary/90 group-hover:to-primary/70",
                          "group-hover:shadow-lg group-hover:shadow-primary/30",
                          "group-hover:scale-105"
                        )}
                        aria-hidden="true"
                      >
                        Buy Now
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile View All with touch feedback */}
        <div className="mt-6 md:hidden text-center">
          <Link
            href="/products"
            className={cn(
              "inline-block px-4 py-3 rounded-md",
              "text-sm font-medium border border-border",
              "hover:bg-accent active:bg-accent/80 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="View all flash deals"
          >
            View All Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
