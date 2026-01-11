"use client";

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';

export function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <Button
      size="sm"
      className="w-full min-h-[44px]"
      onClick={() => addToCart(product)}
      aria-label={`Add ${product?.title || 'product'} to cart`}
    >
      Add to Cart
    </Button>
  );
}
