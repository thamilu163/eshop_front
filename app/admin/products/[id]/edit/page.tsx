'use client';


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function AdminEditProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  return (
    <>
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>Editing product ID: {productId}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Product edit form coming soon.</p>
          </CardContent>
        </Card>
    </>
  );
}
