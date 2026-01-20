'use client';


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Manage stock levels and warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Inventory management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
