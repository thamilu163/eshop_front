import Sidebar from '@/components/layout/sidebar';
import { SellerGuard } from '@/features/seller/components/SellerGuard';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted/40">
        <SellerGuard>
          {children}
        </SellerGuard>
      </main>
    </div>
  );
}
