'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStore } from '@/features/seller/hooks/use-seller';
import { Loader2, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateStorePage() {
  const router = useRouter();
  const createStoreMutation = useCreateStore();
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shopName.trim()) {
      toast.error('Store name is required');
      return;
    }

    createStoreMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Store created successfully!');
        router.push('/seller/products/add');
      },
      onError: (error: any) => {
        toast.error('Failed to create store', {
          description: error.response?.data?.message || error.message || 'Please try again',
        });
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Your Store</h1>
        <p className="text-muted-foreground mt-2">
          Set up your store to start selling products on the marketplace
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="text-primary h-5 w-5" />
              <CardTitle>Store Information</CardTitle>
            </div>
            <CardDescription>
              Provide details about your business that customers will see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                placeholder="e.g., Tech Haven Electronics"
                required
              />
              <p className="text-muted-foreground mt-1 text-xs">
                This will be displayed to customers
              </p>
            </div>

            <div>
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell customers about your store and what you sell..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="shop@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createStoreMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStoreMutation.isPending}>
                {createStoreMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {createStoreMutation.isPending ? 'Creating...' : 'Create Store'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
