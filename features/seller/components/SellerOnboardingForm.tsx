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
import { Store, Loader2, CheckCircle2 } from 'lucide-react';
import { SellerIdentityType, SellerBusinessType } from '@/types';
import { sellerOnboardingSchema, type SellerOnboardingFormData } from '../schemas';
import { useCreateStore } from '@/hooks/queries/use-seller';
import { registerSeller, getSellerProfile } from '../api';
import { sellerApi } from '../api/seller-api';
import { toast } from 'sonner';
import type { StoreCreateRequest } from '../types';
import { logger } from '@/lib/observability/logger';

export function SellerOnboardingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const createStore = useCreateStore();

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
      businessTypes: [],
      identityType: SellerIdentityType.INDIVIDUAL,
    },
  });

  const identityType = watch('identityType');
  const businessTypes = watch('businessTypes');

  const handleBusinessTypeChange = (type: string, checked: boolean) => {
    const current = businessTypes || [];
    const typeEnum = type as SellerBusinessType;
    
    if (checked) {
      setValue('businessTypes', [...current, typeEnum]);
    } else {
      setValue('businessTypes', current.filter((t) => t !== typeEnum));
    }
  };

  const onSubmit = async (data: SellerOnboardingFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      toast.error('Authentication required', {
        description: 'Please log in to continue',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('[Onboarding] Starting flow for:', { email: data.email });

      // Step 1: Check if seller profile exists
      const existingSeller = await getSellerProfile(accessToken);

      // Step 2: Register seller ONLY if no profile exists
      if (!existingSeller) {
        logger.info('[Onboarding] No profile found, registering seller...');
        await registerSeller(data, accessToken);
        logger.info('[Onboarding] Seller registered successfully');
      } else {
        logger.info('[Onboarding] Seller profile already exists, skipping registration');
      }

      // Step 3: Check if store exists
      const storeExists = await sellerApi.checkStoreExists();
      logger.info('[Onboarding] Store exists:', { storeExists });

      // Step 4: Create store ONLY if it doesn't exist
      if (!storeExists) {
        const storeRequest: StoreCreateRequest = {
          storeName: data.displayName,
          description: data.description || `${data.displayName} - Online Store`,
          ...(data.email && { email: data.email }),
          ...(data.phone && { phone: data.phone }),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.info('[Onboarding] Creating store:', storeRequest as any);
        await createStore.mutateAsync(storeRequest);
        logger.info('[Onboarding] Store created successfully');
      } else {
        logger.info('[Onboarding] Store already exists, skipping creation');
      }

      setSuccess(true);

      toast.success('Welcome to selling!', {
        description: 'Your seller account is ready.',
      });

      setTimeout(() => {
        router.push('/seller');
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[Onboarding] Error:', { 
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        originalError: error 
      });
      
      toast.error('Onboarding failed', {
        description: errorMessage,
      });
      setIsSubmitting(false);
    } finally {
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
          {/* Identity Type */}
          <div className="space-y-3">
            <Label className="text-base">Identity Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer w-full">
                <input
                  type="radio"
                  value={SellerIdentityType.INDIVIDUAL}
                  {...register('identityType')}
                  className="h-4 w-4"
                />
                <span className="font-medium">Individual</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer w-full">
                <input
                  type="radio"
                  value={SellerIdentityType.BUSINESS}
                  {...register('identityType')}
                  className="h-4 w-4"
                />
                <span className="font-medium">Business</span>
              </label>
            </div>
            {errors.identityType && (
              <p className="text-sm text-red-500">{errors.identityType.message}</p>
            )}
          </div>

          {/* Business Types */}
          <div className="space-y-3">
            <Label className="text-base">Business Type(s) <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-3">
              {[SellerBusinessType.FARMER, SellerBusinessType.WHOLESALER, SellerBusinessType.RETAILER].map((type) => (
                <label key={type} className="flex items-center gap-2 rounded-lg border p-4 hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={businessTypes?.includes(type)}
                    onCheckedChange={(checked) => handleBusinessTypeChange(type, checked as boolean)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
             {errors.businessTypes && (
              <p className="text-sm text-red-500">{errors.businessTypes.message}</p>
            )}
          </div>

          {/* Farmer Specific: Own Produce */}
          {businessTypes?.includes(SellerBusinessType.FARMER) && (
             <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-4 border border-green-100">
                <Checkbox
                  id="isOwnProduce"
                  onCheckedChange={(checked) => setValue('isOwnProduce', checked as boolean)}
                />
                <Label htmlFor="isOwnProduce" className="cursor-pointer text-green-800">
                  I grow/produce these products myself (verified farmer tag)
                </Label>
             </div>
          )}

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

          {/* Business Name (for Business Identity) */}
          {identityType === SellerIdentityType.BUSINESS && (
          <div className="space-y-2">
            <Label htmlFor="businessName">Legal Business Name <span className="text-red-500">*</span></Label>
            <Input
              id="businessName"
              placeholder="Registered business name"
              {...register('businessName')}
            />
            {errors.businessName && (
              <p className="text-sm text-red-500">{errors.businessName.message}</p>
            )}
          </div>
          )}

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

          
          {/* KYC Documents Section */}
          <div className="space-y-4 rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
              KYC Documents
            </h3>
            
            {/* Individual KYC */}
            {identityType === SellerIdentityType.INDIVIDUAL && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="pan" 
                    placeholder="ABCDE1234F" 
                    {...register('pan')} 
                    className="uppercase"
                    maxLength={10}
                    onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                  />
                  {errors.pan && <p className="text-sm text-red-500">{errors.pan.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
                  <Input 
                    id="aadhaar" 
                    placeholder="12 digit Aadhaar number" 
                    {...register('aadhaar')} 
                    maxLength={12}
                    inputMode="numeric"
                    onInput={(e) => {
                      // Prevent non-numeric input
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                  {errors.aadhaar && <p className="text-sm text-red-500">{errors.aadhaar.message}</p>}
                </div>
              </div>
            )}

            {/* Business KYC */}
            {identityType === SellerIdentityType.BUSINESS && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessPan">Business PAN <span className="text-red-500">*</span></Label>
                    <Input 
                      id="businessPan" 
                      placeholder="ABCDE1234F" 
                      {...register('businessPan')} 
                      className="uppercase"
                      maxLength={10}
                    />
                    {errors.businessPan && <p className="text-sm text-red-500">{errors.businessPan.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">GSTIN <span className="text-red-500">*</span></Label>
                    <Input 
                      id="taxId" 
                      placeholder="22AAAAA0000A1Z5" 
                      {...register('taxId')} 
                      className="uppercase"
                      maxLength={15}
                    />
                    {errors.taxId && <p className="text-sm text-red-500">{errors.taxId.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationProof">Registration Proof Document (Optional)</Label>
                  <Input
                    id="registrationProof"
                    placeholder="URL to document (or file upload placeholder)"
                    {...register('registrationProof')}
                  />
                  <p className="text-xs text-muted-foreground">Upload Certificate of Incorporation, Shop Act License, etc.</p>
                  {errors.registrationProof && <p className="text-sm text-red-500">{errors.registrationProof.message}</p>}
                </div>

                <div className="space-y-2">
                   <Label htmlFor="authorizedSignatory">Authorized Signatory Name <span className="text-red-500">*</span></Label>
                   <Input 
                     id="authorizedSignatory" 
                     placeholder="Full legal name of signatory" 
                     {...register('authorizedSignatory')} 
                   />
                   {errors.authorizedSignatory && <p className="text-sm text-red-500">{errors.authorizedSignatory.message}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4 rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">2</span>
              Bank Details
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="bankAccountNumber" 
                  placeholder="Enter account number" 
                  {...register('bankAccountNumber')} 
                />
                {errors.bankAccountNumber && <p className="text-sm text-red-500">{errors.bankAccountNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankIfsc">IFSC Code <span className="text-red-500">*</span></Label>
                <Input 
                  id="bankIfsc" 
                  placeholder="SBIN0001234" 
                  {...register('bankIfsc')} 
                  className="uppercase"
                  maxLength={11}
                />
                {errors.bankIfsc && <p className="text-sm text-red-500">{errors.bankIfsc.message}</p>}
              </div>
            </div>
          </div>

          {/* Store Info Section Header */}
           <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">3</span>
              Store Information
            </h3>

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
