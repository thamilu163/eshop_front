'use client';

import { useProducts, useCategories, useBrands } from '@/features/products/hooks/use-products';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/loading';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ShoppingCart, Search } from 'lucide-react';
import Link from 'next/link';

// Time Complexity: O(n) where n is number of products rendered
// Space Complexity: O(n) for products data
export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<number | undefined>();
  const { data: productsData, isLoading } = useProducts({
    page,
    size: 12,
    search,
    categoryId,
    brandId,
  });

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { addToCart, isAdding } = useCart();

  // Time Complexity: O(1)
  // Space Complexity: O(1)
  const handleAddToCart = (productId: number) => {
    addToCart({ productId, quantity: 1 });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Products</h1>
        
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={brandId || ''}
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(productsData?.content ?? []).map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
            </Link>

            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
              {product.brand && (
                <CardDescription className="text-xs">{product.brand.name}</CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl font-bold">
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      {calculateDiscount(product.price, product.discountPrice)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="mb-3 text-sm">
                {product.stockQuantity > 0 ? (
                  <span className={product.stockQuantity <= 10 ? 'text-orange-600' : 'text-green-600'}>
                    {product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </div>

              <Button
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stockQuantity === 0 || isAdding}
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {productsData && (productsData.content ?? []).length === 0 && (
        <div className="mt-6 text-center text-muted-foreground">No products found.</div>
      )}
      {productsData && productsData.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            variant="outline"
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page + 1} of {productsData.totalPages}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page >= productsData.totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
