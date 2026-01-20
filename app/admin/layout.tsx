import { AdminSidebar } from '@/components/admin/layout/sidebar';
import { AdminHeader } from '@/components/admin/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
