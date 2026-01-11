/**
 * Seller Onboarding Form Component
 *
 * Multi-step form for seller registration with validation
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Loader2, CheckCircle2 } from 'lucide-react';
import { sellerOnboardingSchema, type SellerOnboardingFormData } from '../schemas';
import { registerSeller } from '../api';
import { toast } from 'sonner';

export function SellerOnboardingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SellerOnboardingFormData>({
    resolver: zodResolver(sellerOnboardingSchema),
    defaultValues: {
      email: session?.user?.email || '',
      acceptedTerms: false,
    },
  });

  const sellerType = watch('sellerType');

  const onSubmit = async (data: SellerOnboardingFormData) => {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      toast.error('Authentication required', {
        description: 'Please log in to continue',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerSeller(data, accessToken);

      console.log('[Onboarding] Success:', response);
      setSuccess(true);

      toast.success('Welcome to selling!', {
        description: 'Your seller account has been created successfully.',
      });

      // Redirect to seller dashboard after 2 seconds
      setTimeout(() => {
        router.push('/seller');
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error('[Onboarding] Error:', error);
      toast.error('Failed to create seller profile', {
        description: error.message || 'Please try again or contact support.',
      });
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Account Created!</h2>
            <p className="text-muted-foreground mt-2">
              Your seller account is ready. Redirecting to dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Become a Seller</CardTitle>
            <CardDescription>Start selling your products to customers worldwide</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seller Type */}
          <div className="space-y-2">
            <Label htmlFor="sellerType">
              Seller Type <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('sellerType', value as any)}
              defaultValue={sellerType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select seller type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual Seller</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="FARMER">Farmer/Producer</SelectItem>
                <SelectItem value="WHOLESALER">Wholesaler</SelectItem>
                <SelectItem value="RETAILER">Retailer</SelectItem>
              </SelectContent>
            </Select>
            {errors.sellerType && (
              <p className="text-sm text-red-500">{errors.sellerType.message}</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="How customers will see your store"
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          {/* Business Name (optional) */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name (optional)</Label>
            <Input
              id="businessName"
              placeholder="Legal business name (if applicable)"
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
            <Input
              id="email"
              type="email"
              placeholder="seller@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone (optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input id="phone" type="tel" placeholder="+1234567890" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Tax ID (optional) */}
          {sellerType === 'BUSINESS' && (
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / VAT Number (optional)</Label>
              <Input
                id="taxId"
                placeholder="Enter your tax identification number"
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
              placeholder="Tell customers about your store and products..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="acceptedTerms"
              onCheckedChange={(checked) => setValue('acceptedTerms', checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="acceptedTerms" className="leading-tight font-normal">
                I accept the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/seller-agreement" target="_blank" className="text-blue-600 underline">
                  Seller Agreement
                </a>
              </Label>
              {errors.acceptedTerms && (
                <p className="text-sm text-red-500">{errors.acceptedTerms.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your seller profile...
              </>
            ) : (
              'Create Seller Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
