/**
 * Seller Profile Page
 *
 * Page for sellers to view and edit their profile
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, Loader2, Save, User } from 'lucide-react';
import { getSellerProfile, updateSellerProfile } from '@/features/seller/api';
import type { SellerProfile } from '@/features/seller/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  sellerProfileUpdateSchema,
  type SellerProfileUpdateFormData,
} from '@/features/seller/schemas';

export default function SellerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SellerProfileUpdateFormData>({
    resolver: zodResolver(sellerProfileUpdateSchema),
  });

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const roles = (session?.roles || []) as string[];
    if (!roles.includes('SELLER')) {
      router.push('/');
      return;
    }

    // Load seller profile
    const loadProfile = async () => {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) return;

      try {
        const data = await getSellerProfile(accessToken);
        if (!data) {
          // No profile exists, redirect to onboarding
          router.push('/seller/onboard');
          return;
        }

        setProfile(data);
        // Populate form with existing data
        reset({
          sellerType: data.sellerType,
          displayName: data.displayName,
          businessName: data.businessName || '',
          email: data.email,
          phone: data.phone || '',
          taxId: data.taxId || '',
          description: data.description || '',
        });
      } catch (error) {
        console.error('[SellerProfile] Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session, status, router, reset]);

  const onSubmit = async (data: SellerProfileUpdateFormData) => {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    setSaving(true);

    try {
      const updated = await updateSellerProfile(data, accessToken);
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('[SellerProfile] Update failed:', error);
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Seller Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your seller information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {profile?.status === 'ACTIVE' ? (
                    <span className="text-green-600">Active Seller</span>
                  ) : (
                    <span className="text-gray-600">Status: {profile?.status}</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="Store display name"
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500">{errors.displayName.message}</p>
                )}
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (optional)</Label>
                <Input
                  id="businessName"
                  placeholder="Legal business name"
                  {...register('businessName')}
                />
                {errors.businessName && (
                  <p className="text-sm text-red-500">{errors.businessName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input id="phone" type="tel" placeholder="+1234567890" {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Tax ID */}
              {profile?.sellerType === 'BUSINESS' && (
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID (optional)</Label>
                  <Input
                    id="taxId"
                    placeholder="Tax identification number"
                    {...register('taxId')}
                  />
                  {errors.taxId && <p className="text-sm text-red-500">{errors.taxId.message}</p>}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Store Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your store..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/seller')}>
                  Back to Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Profile Metadata */}
        {profile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller Type:</span>
                <span className="font-medium">{profile.sellerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since:</span>
                <span className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
