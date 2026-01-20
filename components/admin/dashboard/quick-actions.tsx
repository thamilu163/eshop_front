'use client';

import Link from 'next/link';
import { Plus, Upload, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function QuickActions({ onRefresh, onExport }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
