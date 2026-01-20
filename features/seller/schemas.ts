/**
 * Seller Validation Schemas
 *
 * Zod schemas for seller onboarding and profile management
 */

import { z } from 'zod';
import { SellerIdentityType, SellerBusinessType } from '@/types';

export const SellerIdentityTypeEnum = z.nativeEnum(SellerIdentityType);
export const SellerBusinessTypeEnum = z.nativeEnum(SellerBusinessType);

// KYC Refinement Logic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kycRefinement = (data: any, ctx: z.RefinementCtx) => {
  // INDIVIDUAL Validation
  if (data.identityType === SellerIdentityType.INDIVIDUAL) {
    if (!data.pan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'PAN is required for individuals',
        path: ['pan'],
      });
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid PAN format (e.g. ABCDE1234F)',
        path: ['pan'],
      });
    }

    if (data.aadhaar && !/^\d{12}$/.test(data.aadhaar)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Aadhaar must be exactly 12 digits (numbers only)',
        path: ['aadhaar'],
      });
    }
  }

  // BUSINESS Validation
  if (data.identityType === SellerIdentityType.BUSINESS) {
    if (!data.businessName || data.businessName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business Name is required',
        path: ['businessName'],
      });
    }
    
    if (!data.businessPan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business PAN is required',
        path: ['businessPan'],
      });
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.businessPan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Business PAN format',
        path: ['businessPan'],
      });
    }

    if (!data.taxId) { // GSTIN
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GSTIN is required for businesses',
        path: ['taxId'],
      });
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.taxId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid GSTIN format',
        path: ['taxId'],
      });
    }

    if (!data.authorizedSignatory || data.authorizedSignatory.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Authorized Signatory Name is required',
        path: ['authorizedSignatory'],
      });
    }
    
    // Registration Proof is now optional
    // if (!data.registrationProof) {
    //      ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: 'Registration Proof document is required',
    //         path: ['registrationProof'],
    //       });
    // }
  }
};

const sellerBaseSchema = z.object({
  identityType: SellerIdentityTypeEnum,
  businessTypes: z.array(SellerBusinessTypeEnum).min(1, 'Select at least one business type'),
  isOwnProduce: z.boolean().optional(),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
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
  
  // Commercial/Business Fields (initially optional, refined below)
  businessName: z.string().optional(),
  taxId: z.string().toUpperCase().optional(), // GSTIN - Auto convert to uppercase
  businessPan: z.string().toUpperCase().optional(), // Auto convert
  registrationProof: z.string().optional(), // URL or file path
  authorizedSignatory: z.string().optional(),

  // Individual/KYC Fields
  pan: z.string().toUpperCase().optional(), // Auto convert
  aadhaar: z.string().optional(),
  
  // Bank Details (Common)
  bankAccountNumber: z.string().min(8, 'Invalid account number').max(20, 'Invalid account number'),
  bankIfsc: z.string().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
});

export const sellerOnboardingSchema = sellerBaseSchema.superRefine(kycRefinement);

// Schema for profile updates (without acceptedTerms)
// We use the base schema first to omit, then re-apply refinement
export const sellerProfileUpdateSchema = sellerBaseSchema
  .omit({ acceptedTerms: true })
  .superRefine(kycRefinement);

export type SellerOnboardingFormData = z.infer<typeof sellerOnboardingSchema>;
export type SellerProfileUpdateFormData = z.infer<typeof sellerProfileUpdateSchema>;
