import { SellerHeader } from '@/components/seller/layout/header';
import { SellerSidebar } from '@/components/seller/layout/sidebar';
import { SellerGuard } from '@/features/seller/components/SellerGuard';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <SellerHeader />
      <div className="flex pt-16">
        <SellerSidebar />
        <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300">
          <SellerGuard>
            {children}
          </SellerGuard>
        </main>
      </div>
    </div>
  );
}
