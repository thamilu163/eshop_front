'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { featuredProducts } from '@/constants';
import { cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/home/AddToCartButton';

export function FeaturedProductsSection() {
  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="py-10 md:py-16" aria-labelledby="featured-products-heading">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 id="featured-products-heading" className="text-2xl font-semibold mb-2">Featured Products</h2>
          <p className="text-muted-foreground">No featured products available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-10 md:py-16 bg-muted dark:bg-muted/20')} aria-labelledby="featured-products-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 id="featured-products-heading" className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked products just for you</p>
          </div>

          <Button variant="ghost" asChild className="hidden md:inline-flex items-center gap-2">
            <Link href="/products">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group transition-all duration-300 border border-border hover:shadow-xl hover:border-primary bg-card">
              <CardContent className="p-4 flex flex-col items-start">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={128}
                  height={128}
                  sizes="(max-width: 768px) 96px, 128px"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform"
                />

                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-3" role="group" aria-label="Price">
                  <span className="text-xl font-bold text-primary">
                    <span className="sr-only">Current price:</span>${product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm line-through text-muted-foreground">
                      <span className="sr-only">Original price:</span>${product.oldPrice}
                    </span>
                  )}
                </div>

                <AddToCartButton product={product} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 md:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/products">
              View All Products
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
