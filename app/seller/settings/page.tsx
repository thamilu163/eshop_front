'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSellerStore } from '@/features/seller/hooks/use-seller';
import { Loader2, Store, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SellerSettingsPage() {
  const router = useRouter();
  const { data: storeData, isLoading } = useSellerStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!storeData?.id) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Store Setup Required</CardTitle>
          <CardDescription>Create your store before accessing settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/seller/store/create')}>Create Store</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your store information and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="text-primary h-5 w-5" />
              <CardTitle>Store Information</CardTitle>
            </div>
            <CardDescription>Update your store details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                defaultValue={storeData?.shopName || ''}
                placeholder="Enter your store name"
              />
            </div>

            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                defaultValue={storeData?.description || ''}
                placeholder="Describe your store and products..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={storeData?.email || ''}
                  placeholder="store@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={storeData?.phone || ''}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                defaultValue={storeData?.address || ''}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
