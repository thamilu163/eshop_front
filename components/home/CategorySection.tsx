import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { categories } from '@/constants';
import { cn } from '@/lib/utils';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');
}

// Map the known color tokens to explicit class strings so Tailwind can see them.
const gradientClassMap: Record<string, string> = {
  'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500': 'from-pink-500 to-rose-500',
  'from-green-500 to-emerald-500': 'from-green-500 to-emerald-500',
  'from-orange-500 to-yellow-500': 'from-orange-500 to-yellow-500',
  'from-purple-500 to-pink-500': 'from-purple-500 to-pink-500',
  'from-indigo-500 to-blue-500': 'from-indigo-500 to-blue-500',
};

export function CategorySection() {
  if (!categories || !Array.isArray(categories) || (categories as readonly unknown[]).length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900" aria-labelledby="category-section-heading">
        <div className="container mx-auto px-4 md:px-6">
          <h2 id="category-section-heading" className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" aria-labelledby="category-section-heading">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div className="flex-1">
            <h2 id="category-section-heading" className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">Explore our wide range of products across all categories</p>
          </div>

          <Button asChild size="lg" variant="outline" className="shrink-0 group shadow-md hover:shadow-xl transition-shadow">
            <Link href="/products" className="inline-flex items-center gap-2">
              View All Categories
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6">
          {categories.map((category) => {
            const slug = slugify(category.name);
            const gradientClasses = gradientClassMap[category.color] ?? 'from-gray-300 to-gray-400';

            return (
              <Link
                href={`/products?category=${encodeURIComponent(slug)}`}
                key={category.name}
                className="block group"
                aria-label={`Browse ${category.name} category with ${category.count} products`}
              >
                <Card className={cn(
                  "h-full transition-all duration-300",
                  "hover:shadow-2xl hover:-translate-y-2",
                  "focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-primary focus-visible:ring-offset-2",
                  "border border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-800",
                  "hover:border-primary/50"
                )}>
                  <CardContent className="p-5 md:p-6 text-center flex flex-col items-center justify-center">
                    <div
                      className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto mb-4 md:mb-5",
                        "flex items-center justify-center text-3xl md:text-4xl",
                        "shadow-lg transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl",
                        `bg-gradient-to-br ${gradientClasses}`
                      )}
                      aria-hidden="true"
                    >
                      <span aria-hidden="true">{category.icon}</span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900 dark:text-white truncate max-w-full">
                      {category.name}
                    </h3>
                    <p className={cn(
                      "text-xs md:text-sm text-muted-foreground",
                      "px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700",
                      "group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                    )}>
                      {category.count} Products
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
