'use client';

import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import axios from 'axios';
import apiClient from '@/lib/axios';

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
    };
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

export default function AdminOrdersPage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!user?.roles?.includes(UserRole.ADMIN)) {
      router.push('/');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, user, router, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<Order>>(
        `/api/orders?page=${currentPage}&size=10`
      );
      
      if (response.data.success && response.data.data) {
        setOrders(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      'PROCESSING': { color: 'bg-indigo-100 text-indigo-800', icon: Package, label: 'Processing' },
      'SHIPPED': { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
      'DELIVERED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status.toUpperCase()] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: totalElements,
    pending: orders.filter(o => o.status.toUpperCase() === 'PENDING').length,
    processing: orders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status.toUpperCase())).length,
    shipped: orders.filter(o => o.status.toUpperCase() === 'SHIPPED').length,
    delivered: orders.filter(o => o.status.toUpperCase() === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status.toUpperCase() === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-6">
        <Sidebar />
        <main className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-primary" />
                Order Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage all orders across the platform
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Need action</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Shipped</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                <p className="text-xs text-muted-foreground">In transit</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders List</CardTitle>
              <CardDescription>
                Showing {filteredOrders.length} of {totalElements} orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-mono font-semibold">{order.orderNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.user.name}</div>
                            <div className="text-sm text-muted-foreground">{order.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(order.orderDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.orderDate).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{order.orderItems.length} items</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-lg">
                              ₹{order.totalAmount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select defaultValue={order.status.toLowerCase()}>
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
