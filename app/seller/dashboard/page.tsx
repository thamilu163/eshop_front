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

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface DashboardData {
  stats?: DashboardStats;
  recentProducts?: any[];
  error?: string;
}

export default async function SellerDashboardPage() {
  console.log('[SellerDashboard/Page] 📄 Rendering server component');
  
  const session = await getServerSession(authOptions);

  console.log('[SellerDashboard/Page] Session check');
  console.log('[SellerDashboard/Page] User:', session?.user?.email);
  console.log('[SellerDashboard/Page] Roles:', session?.roles?.join(', ') || 'none');

  // Double-check authentication (middleware should have caught this)
  if (!session) {
    console.log('[SellerDashboard/Page] ❌ No session, redirecting to login');
    redirect('/login?callbackUrl=/seller/dashboard');
  }

  // Double-check role (middleware should have caught this)
  if (!session.roles?.includes('SELLER')) {
    console.log('[SellerDashboard/Page] ❌ Not a seller, redirecting to access-denied');
    redirect('/access-denied');
  }

  // Check for session errors
  if (session.error) {
    console.log('[SellerDashboard/Page] ⚠️ Session has error:', session.error);
    redirect('/login?error=session_expired');
  }

  // Fetch initial data from backend API (SERVER-SIDE)
  let initialData: DashboardData = {};
  
  try {
    console.log('[SellerDashboard/Page] 🔄 Fetching seller dashboard data from backend...');
    console.log('[SellerDashboard/Page] API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080');
    console.log('[SellerDashboard/Page] Token:', (session as any).accessToken ? 'present' : 'missing');
    
    const data = await serverBackendFetch<SellerDashboardResponse>(
      '/api/v1/dashboard/seller',
      (session as any).accessToken
    );

    // Transform backend response to match our component interface
    initialData = {
      stats: {
        totalProducts: data.data.shopOverview.totalProducts,
        lowStockProducts: data.data.shopOverview.outOfStockProducts,
        totalRevenue: 0, // Backend doesn't provide this yet
        pendingOrders: data.data.orderManagement.newOrders,
      },
      recentProducts: data.data.topProducts.map(p => ({
        id: p.productId,
        name: p.productName,
        price: p.currentPrice,
        stock: p.stockQuantity,
      })),
    };
    
    console.log('[SellerDashboard/Page] ✅ Backend data fetched successfully');
  } catch (error: any) {
    console.error('[SellerDashboard/Page] ❌ Failed to fetch from backend:', {
      message: error?.message,
      name: error?.name,
    });
    initialData.error = error?.message || 'Failed to connect to backend';
  }

  console.log('[SellerDashboard/Page] ✅ Rendering client component with initial data');

  return (
    <SellerDashboardClient 
      session={session} 
      initialData={initialData} 
    />
  );
}
