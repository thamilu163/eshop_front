'use client';

import { AlertTriangle, Info, CheckCircle, XCircle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/formatters';
import type { SystemAlert } from '@/types/dashboard';

interface AlertsCardProps {
  alerts: SystemAlert[];
  isLoading?: boolean;
}

export function AlertsCard({ alerts, isLoading }: AlertsCardProps) {
  if (isLoading) return <AlertsSkeleton />;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          System Alerts
        </CardTitle>
        <CardDescription>Recent system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] pr-4 overflow-y-auto">
          <div className="space-y-4">
            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
                    <p>All systems normal</p>
                </div>
            ) : (
                alerts.map((alert) => (
                <div
                    key={alert.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                    <AlertIcon type={alert.type} />
                    <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(alert.timestamp)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {alert.message}
                    </p>
                    {alert.actionLabel && (
                        <a
                        href={alert.actionUrl || '#'}
                        className="text-xs text-primary hover:underline inline-block mt-1"
                        >
                        {alert.actionLabel}
                        </a>
                    )}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertIcon({ type }: { type: SystemAlert['type'] }) {
  switch (type) {
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />;
    default:
      return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
  }
}

function AlertsSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                         <div key={i} className="flex gap-3">
                             <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                             <div className="flex-1 space-y-2">
                                 <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                                 <div className="h-3 w-full bg-muted rounded animate-pulse" />
                             </div>
                         </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
