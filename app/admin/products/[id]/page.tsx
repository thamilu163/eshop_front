'use client';

import Sidebar from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function AdminProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-6">
      <Sidebar />
      <main className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Viewing product ID: {productId}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Product details view coming soon.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
