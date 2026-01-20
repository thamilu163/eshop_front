'use client';

import PromotionalBanner from './promotional-banner';

import Header from './header';

import { usePathname } from 'next/navigation';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/seller');

  if (isDashboard) {
    return null;
  }

  return (
    <>
      <PromotionalBanner />
      <Header />
    </>
  );
}
