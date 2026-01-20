/**
 * Seller Dashboard - Server Component
 * 
 * Implements two-layer authentication:
 * 1. Middleware checks authentication and SELLER role
 * 2. This page validates session and fetches initial data from backend API
 * 3. Client component makes subsequent API calls with Bearer token
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SellerDashboardClient from './SellerDashboardClient';
import { serverBackendFetch, SellerDashboardResponse } from '@/lib/api/backend';
import { logger } from '@/lib/observability/logger';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface DashboardData {
  stats?: DashboardStats;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentProducts?: any[];
  error?: string;
}

export default async function SellerDashboardPage() {
  logger.debug('[SellerDashboard/Page] Rendering server component');
  
  const session = await getServerSession(authOptions);

  logger.debug('[SellerDashboard/Page] Session check', { user: session?.user?.email, roles: session?.roles });

  // Double-check authentication (middleware should have caught this)
  if (!session) {
    logger.warn('[SellerDashboard/Page] No session, redirecting to login');
    redirect('/login?callbackUrl=/seller/dashboard');
  }

  // Double-check role (middleware should have caught this)
  if (!session.roles?.includes('SELLER')) {
    logger.warn('[SellerDashboard/Page] Not a seller, redirecting to access-denied');
    redirect('/access-denied');
  }

  // Check for session errors
  if (session.error) {
    logger.warn('[SellerDashboard/Page] Session has error', { error: session.error });
    redirect('/login?error=session_expired');
  }

  // Fetch initial data from backend API (SERVER-SIDE)
  let initialData: DashboardData = {};
  
  try {
    logger.debug('[SellerDashboard/Page] Fetching seller dashboard data from backend...');
    
    const data = await serverBackendFetch<SellerDashboardResponse>(
      '/api/v1/dashboard/seller',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken
    );

    // Transform backend response to match our component interface
    const dashboardData = data?.data;
    
    initialData = {
      stats: {
        totalProducts: dashboardData?.shopOverview?.totalProducts || 0,
        lowStockProducts: dashboardData?.shopOverview?.outOfStockProducts || 0,
        totalRevenue: 0, // Backend doesn't provide this yet
        pendingOrders: dashboardData?.orderManagement?.newOrders || 0,
      },
      recentProducts: dashboardData?.topProducts?.map(p => ({
        id: p.productId,
        name: p.productName,
        price: p.currentPrice,
        stock: p.stockQuantity,
      })) || [],
    };
    
    logger.info('[SellerDashboard/Page] Backend data fetched successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Check for 428 Precondition Required (Incomplete Profile)
    if (error?.message?.includes('428')) {
      logger.warn('[SellerDashboard/Page] Incomplete seller profile (428), redirecting to onboarding');
      redirect('/seller/onboard');
    }

    logger.error('[SellerDashboard/Page] Failed to fetch from backend', {
      message: error?.message,
      name: error?.name,
    });
    initialData.error = error?.message || 'Failed to connect to backend';
  }

  logger.debug('[SellerDashboard/Page] Rendering client component with initial data');

  return (
    <SellerDashboardClient 
      session={session} 
      initialData={initialData} 
    />
  );
}
