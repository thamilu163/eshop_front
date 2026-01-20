// app/customer/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  Heart,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============ Types ============
interface CustomerDashboardData {
  totalOrders: number;
  pendingOrders: number;
  cartItems: number;
  totalSpent: number;
  rewardPoints: number;
  monthlySpent: number;
  monthlyOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  itemCount: number;
}

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  discount: number;
  inStock: boolean;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
}

interface ExtendedSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken?: string;
  roles?: string[];
}

// ============ API Functions ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/v1';

async function fetchWithAuth<T>(endpoint: string, accessToken: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

// ============ Sub-Components ============
function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  subtitle,
  valueColor,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  subtitle: string;
  valueColor?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">{title}</span>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className={`text-3xl font-bold ${valueColor || ''}`}>{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: RecentOrder['status'] }) {
  const statusConfig = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      label: 'Pending',
    },
    PROCESSING: {
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      label: 'Processing',
    },
    SHIPPED: {
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      label: 'Shipped',
    },
    DELIVERED: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      label: 'Delivered',
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      label: 'Cancelled',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant="secondary" className={`text-xs ${config.color}`}>
      {config.label}
    </Badge>
  );
}

function RecentOrdersCard({
  orders,
  loading,
  error,
  onRetry,
  onViewAll,
}: {
  orders: RecentOrder[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onViewAll: () => void;
}) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="mb-2 h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-muted-foreground mb-2 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground">No orders yet</p>
            <Button variant="link" onClick={onViewAll}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-muted/50 hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all"
              >
                <div>
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="text-muted-foreground text-sm">
                    {formatDate(order.createdAt)} • {order.itemCount}{' '}
                    {order.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WishlistCard({
  items,
  loading,
  error,
  onRetry,
  onViewAll,
  onAddToCart,
}: {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onViewAll: () => void;
  onAddToCart: (productId: string) => void;
}) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Wishlist</CardTitle>
          <CardDescription>Items you're interested in</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div>
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-muted-foreground mb-2 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <Heart className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <Button variant="link" onClick={onViewAll}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="text-muted-foreground h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="line-clamp-1 font-medium">{item.productName}</div>
                    {item.discount > 0 && (
                      <div className="text-sm text-green-600">{item.discount}% off</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{formatCurrency(item.price)}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    disabled={!item.inStock}
                    onClick={() => onAddToCart(item.productId)}
                  >
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    {
      label: 'Browse Products',
      icon: '🛒',
      color: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950',
      href: '/products',
    },
    {
      label: 'Track Orders',
      icon: '📦',
      color:
        'border-orange-200 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950',
      href: '/customer/orders',
    },
    {
      label: 'View Cart',
      icon: '🛍️',
      color:
        'border-purple-200 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950',
      href: '/cart',
    },
    {
      label: 'Wishlist',
      icon: '❤️',
      color: 'border-red-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950',
      href: '/customer/wishlist',
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Explore products and manage your shopping</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.href)}
              className={`border-2 p-4 ${action.color} group rounded-lg text-center transition-all`}
            >
              <div className="mb-2 text-3xl transition-transform group-hover:scale-110">
                {action.icon}
              </div>
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ShoppingSummaryCard({
  dashboard,
  loading,
}: {
  dashboard: CustomerDashboardData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Shopping Summary</CardTitle>
        <CardDescription>Your activity this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Orders This Month</span>
            </div>
            <span className="font-bold text-blue-600">{dashboard?.monthlyOrders || 0}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-linear-to-r from-green-50 to-emerald-50 p-3 dark:from-green-950 dark:to-emerald-950">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Spent This Month</span>
            </div>
            <span className="font-bold text-green-600">
              {formatCurrency(dashboard?.monthlySpent || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-linear-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-950 dark:to-pink-950">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Reward Points</span>
            </div>
            <span className="font-bold text-purple-600">{dashboard?.rewardPoints || 0} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationsCard({
  products,
  loading,
  onViewProduct,
}: {
  products: RecommendedProduct[];
  loading: boolean;
  onViewProduct: (productId: string) => void;
}) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Based on your shopping history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div>
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground">No recommendations yet</p>
            <p className="text-muted-foreground text-xs">
              Start shopping to get personalized recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-muted/50 hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all"
                onClick={() => onViewProduct(product.id)}
              >
                <div className="flex items-center gap-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                      <Package className="text-muted-foreground h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="line-clamp-1 text-sm font-medium">{product.name}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground text-xs">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
                  <Button size="sm" variant="ghost" className="mt-1 h-7 text-xs">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Main Component ============
export default function CustomerDashboardPage() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const router = useRouter();

  // State
  const [dashboard, setDashboard] = useState<CustomerDashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);

  // Loading states
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  // Error states
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  // Fetch functions
  const fetchDashboard = useCallback(async (token: string) => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await fetchWithAuth<CustomerDashboardData>('/dashboard/customer', token);
      setDashboard(data);
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async (token: string) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await fetchWithAuth<RecentOrder[]>('/orders/recent?limit=5', token);
      setRecentOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async (token: string) => {
    setWishlistLoading(true);
    setWishlistError(null);
    try {
      const data = await fetchWithAuth<WishlistItem[]>('/wishlist?limit=5', token);
      setWishlistItems(data);
    } catch (err) {
      setWishlistError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async (token: string) => {
    setRecommendationsLoading(true);
    try {
      const data = await fetchWithAuth<RecommendedProduct[]>(
        '/products/recommendations?limit=5',
        token
      );
      setRecommendations(data);
    } catch (err) {
      // Silently fail for recommendations - not critical
      console.warn('Failed to load recommendations:', err);
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) {
      return;
    }

    const token = session.accessToken;

    // Fetch all data in parallel
    fetchDashboard(token);
    fetchRecentOrders(token);
    fetchWishlist(token);
    fetchRecommendations(token);
  }, [status, session, fetchDashboard, fetchRecentOrders, fetchWishlist, fetchRecommendations]);

  // Handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleAddToCart = async (productId: string) => {
    if (!session?.accessToken) return;

    try {
      await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      // Refresh dashboard to update cart count
      fetchDashboard(session.accessToken);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Loading state for authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="space-y-6">
          {/* Dashboard Error Alert */}
          {dashboardError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {dashboardError}
                <Button
                  variant="link"
                  className="ml-2 h-auto p-0"
                  onClick={() => session?.accessToken && fetchDashboard(session.accessToken)}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Card */}
          <Card className="border-2 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Welcome back, {user?.name || 'Customer'}!
                    </CardTitle>
                    <CardDescription className="text-base">
                      🛍️ Happy Shopping at EShop
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-sm text-white">
                  Customer Account
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={dashboard?.totalOrders || 0}
              icon={ShoppingBag}
              iconColor="text-blue-600"
              subtitle="Lifetime orders"
              loading={dashboardLoading}
            />
            <StatCard
              title="Pending Orders"
              value={dashboard?.pendingOrders || 0}
              icon={Package}
              iconColor="text-orange-600"
              subtitle="Currently processing"
              valueColor="text-orange-600"
              loading={dashboardLoading}
            />
            <StatCard
              title="Cart Items"
              value={dashboard?.cartItems || 0}
              icon={ShoppingCart}
              iconColor="text-purple-600"
              subtitle="Ready to checkout"
              loading={dashboardLoading}
            />
            <StatCard
              title="Total Spent"
              value={formatCurrency(dashboard?.totalSpent || 0)}
              icon={DollarSign}
              iconColor="text-green-600"
              subtitle="Lifetime purchases"
              valueColor="text-green-600"
              loading={dashboardLoading}
            />
          </div>

          {/* Quick Actions */}
          <QuickActionsCard onNavigate={handleNavigate} />

          {/* Orders & Wishlist */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentOrdersCard
              orders={recentOrders}
              loading={ordersLoading}
              error={ordersError}
              onRetry={() => session?.accessToken && fetchRecentOrders(session.accessToken)}
              onViewAll={() => handleNavigate('/customer/orders')}
            />
            <WishlistCard
              items={wishlistItems}
              loading={wishlistLoading}
              error={wishlistError}
              onRetry={() => session?.accessToken && fetchWishlist(session.accessToken)}
              onViewAll={() => handleNavigate('/customer/wishlist')}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Summary & Recommendations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ShoppingSummaryCard dashboard={dashboard} loading={dashboardLoading} />
            <RecommendationsCard
              products={recommendations}
              loading={recommendationsLoading}
              onViewProduct={(id) => handleNavigate(`/products/${id}`)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
