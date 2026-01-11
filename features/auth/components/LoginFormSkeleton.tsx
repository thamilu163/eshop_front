/**
 * Login Form Skeleton Loader
 * Displays while the LoginForm component is loading
 * Maintains visual consistency during Suspense fallback
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        {/* Title skeleton */}
        <Skeleton className="mx-auto h-8 w-32" />

        {/* Description skeleton */}
        <Skeleton className="mx-auto h-4 w-64" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Username field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Forgot password link */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full" />

        {/* Divider */}
        <div className="relative my-4">
          <Skeleton className="h-px w-full" />
        </div>

        {/* OAuth button */}
        <Skeleton className="h-10 w-full" />
      </CardContent>

      <CardFooter>
        <Skeleton className="mx-auto h-4 w-48" />
      </CardFooter>
    </Card>
  );
}
