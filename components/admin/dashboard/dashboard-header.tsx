'use client';

import { Clock, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  lastUpdated: Date | null;
  isFetching?: boolean;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  lastUpdated,
  isFetching,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatRelativeTime(lastUpdated.toISOString())}</span>
            {isFetching && <RefreshCw className="h-3 w-3 animate-spin" />}
          </div>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
