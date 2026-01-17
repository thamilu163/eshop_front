'use client';

import { useSession } from 'next-auth/react';
import { env } from '@/env';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye,  MoreHorizontal, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { OrderDTO, OrderStatus, PaymentStatus } from '@/types';

// Mock data for development when API is not ready
const MOCK_ORDERS: OrderDTO[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customer: {
      id: 101,
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER' as any,
      active: true,
      createdAt: new Date().toISOString()
    },
    items: [],
    totalAmount: 156.00,
    shippingAddress: '123 Main St, Anytown, USA',
    orderStatus: OrderStatus.PLACED,
    paymentStatus: PaymentStatus.PAID,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customer: {
      id: 102,
      username: 'jane_smith',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER' as any,
      active: true,
      createdAt: new Date().toISOString()
    },
    items: [],
    totalAmount: 89.50,
    shippingAddress: '456 Oak Ave, Somewhere, CA',
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-003',
    customer: {
      id: 103,
      username: 'bob_jones',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Jones',
      role: 'CUSTOMER' as any,
      active: true,
      createdAt: new Date().toISOString()
    },
    items: [],
    totalAmount: 210.00,
    shippingAddress: '789 Pine Ln, Nowhere, NY',
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const roles = (session?.roles || []) as string[];
    if (!roles.includes('SELLER')) {
      router.push('/');
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        // Fallback to mock data if no real backend connection or for demo
        console.log('Using mock data for orders');
        setOrders(MOCK_ORDERS);
        setLoading(false);
        return;
      }

      // Try to fetch from API
      // Adjust endpoint as necessary based on backend routes
      const res = await fetch(`${env.apiBaseUrl}/api/v1/orders/seller`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.warn(`[Seller/Orders] API returned ${res.status} ${res.statusText}. Using mock data.`);
        setOrders(MOCK_ORDERS);
      } else {
        const data = await res.json();
        setOrders(data.data || data); // Adjust based on actual API response structure
      }
    } catch (err: any) {
      console.warn('[Seller/Orders] Fetch failed, using mock data:', err);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED:
        return <Badge variant="secondary">Placed</Badge>;
      case OrderStatus.CONFIRMED:
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case OrderStatus.PACKED:
        return <Badge className="bg-purple-500">Packed</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge className="bg-orange-500">Shipped</Badge>;
      case OrderStatus.DELIVERED:
        return <Badge className="bg-green-500">Delivered</Badge>;
      case OrderStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 md:px-6">
        <main className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <Button>Export Orders</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Manage your shop&apos;s orders and shipments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No orders found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.customer.firstName} {order.customer.lastName}</span>
                            <span className="text-xs text-muted-foreground">{order.customer.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Packed
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
