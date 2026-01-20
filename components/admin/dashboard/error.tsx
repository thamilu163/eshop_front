'use client';

import { AlertCircle, RefreshCw, Server, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { ApiError } from '@/types/api';

interface DashboardErrorProps {
  error: ApiError | null;
  onRetry: () => void;
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  const isNetworkError =
    error?.code === 'SERVICE_UNAVAILABLE' || error?.code === 'FETCH_ERROR';

  const isAuthError =
    error?.code === 'UNAUTHORIZED' || error?.code === 'FORBIDDEN';

  return (
    <Card className="border-destructive/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          {isNetworkError ? (
            <Wifi className="h-8 w-8 text-destructive" />
          ) : isAuthError ? (
            <Server className="h-8 w-8 text-destructive" />
          ) : (
            <AlertCircle className="h-8 w-8 text-destructive" />
          )}
        </div>
        <CardTitle>
          {isNetworkError
            ? 'Connection Error'
            : isAuthError
            ? 'Access Denied'
            : 'Dashboard Unavailable'}
        </CardTitle>
        <CardDescription>
          {isNetworkError
            ? 'Unable to connect to the dashboard service. Please check your connection.'
            : isAuthError
            ? 'You do not have permission to access the dashboard.'
            : 'We encountered an issue loading the dashboard data.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {error?.message && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground font-mono">
              {error.message}
            </p>
            {error.requestId && (
              <p className="text-xs text-muted-foreground mt-2">
                Request ID: {error.requestId}
              </p>
            )}
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="text-left rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Developer Info:</p>
            <p className="text-sm text-muted-foreground">
              Backend URL:{' '}
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}
              </code>
            </p>
            <p className="text-sm text-muted-foreground">
              Endpoint:{' '}
              <code className="bg-muted px-2 py-1 rounded">
                GET /api/v1/dashboard/admin
              </code>
            </p>
          </div>
        )}

        {!isAuthError && (
          <Button onClick={onRetry} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
