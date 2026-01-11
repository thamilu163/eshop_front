/**
 * Seller Validation Schemas
 *
 * Zod schemas for seller onboarding and profile management
 */

import { z } from 'zod';

export const sellerTypeEnum = z.enum([
  'INDIVIDUAL',
  'BUSINESS',
  'FARMER',
  'WHOLESALER',
  'RETAILER',
]);

export const sellerOnboardingSchema = z.object({
  sellerType: sellerTypeEnum,
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters'),
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must be less than 200 characters')
    .optional(),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .min(5, 'Tax ID must be at least 5 characters')
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
});

// Schema for profile updates (without acceptedTerms)
export const sellerProfileUpdateSchema = sellerOnboardingSchema.omit({ acceptedTerms: true });

export type SellerOnboardingFormData = z.infer<typeof sellerOnboardingSchema>;
export type SellerProfileUpdateFormData = z.infer<typeof sellerProfileUpdateSchema>;
