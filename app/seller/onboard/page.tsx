/**
 * Seller Onboarding Page
 *
 * Public page where customers can register to become sellers
 */

import { Metadata } from 'next';
import { SellerOnboardingForm } from '@/features/seller/components/SellerOnboardingForm';

export const metadata: Metadata = {
  title: 'Become a Seller | eShop',
  description: 'Start selling your products to customers worldwide',
};

export default function SellerOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Start Your Selling Journey</h1>
          <p className="text-muted-foreground mt-2 text-xl">
            Join thousands of sellers reaching millions of customers
          </p>
        </div>

        <SellerOnboardingForm />

        {/* Benefits Section */}
        <div className="mx-auto mt-12 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">Why Sell With Us?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-3 text-4xl">🌍</div>
              <h3 className="mb-2 font-semibold">Global Reach</h3>
              <p className="text-muted-foreground text-sm">
                Connect with customers from around the world
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-3 text-4xl">💳</div>
              <h3 className="mb-2 font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">
                Get paid on time with our secure payment system
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-3 text-4xl">📊</div>
              <h3 className="mb-2 font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground text-sm">
                Track your sales and grow your business
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
