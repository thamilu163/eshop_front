'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle, Users, Shield, Sprout, Store, Building2, Truck, ShoppingCart } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
  shop?: {
    id: number;
    shopName: string;
    sellerType: 'FARMER' | 'RETAIL_SELLER' | 'WHOLESALER' | 'SHOP';
  };
}

interface PageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
      if (!user?.roles?.includes(UserRole.ADMIN)) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, pageInfo.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = roleFilter === 'ALL' 
        ? '/api/users'
        : `/api/users/role/${roleFilter}`;
      
      const response = await apiClient.get(endpoint, {
        params: {
          page: pageInfo.currentPage,
          size: pageInfo.pageSize
        }
      });

      // Extract data from ApiResponse wrapper
      const pageData = response.data.data || response.data;
      setUsers(pageData.content || []);
      setPageInfo({
        totalElements: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
        currentPage: pageData.currentPage || 0,
        pageSize: pageData.pageSize || 10
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/users/search`, {
        params: {
          keyword: searchQuery,
          page: 0,
          size: pageInfo.pageSize
        }
      });

      // Extract data from ApiResponse wrapper
      const pageData = response.data.data || response.data;
      setUsers(pageData.content || []);
      setPageInfo({
        totalElements: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
        currentPage: 0,
        pageSize: pageData.pageSize || 10
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus 
        ? `/api/users/${userId}/deactivate`
        : `/api/users/${userId}/activate`;
      
      await apiClient.put(endpoint, {});
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'SELLER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELIVERY_AGENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CUSTOMER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSellerTypeBadgeColor = (sellerType: string) => {
    switch (sellerType) {
      case 'FARMER':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'RETAIL_SELLER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'WHOLESALER':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'SHOP':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatSellerType = (sellerType: string) => {
    switch (sellerType) {
      case 'FARMER':
        return 'Farmer';
      case 'RETAIL_SELLER':
        return 'Retail Only';
      case 'WHOLESALER':
        return 'Wholesale Only';
      case 'SHOP':
        return 'Flexible Shop';
      default:
        return sellerType;
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (!isAuthenticated || !user?.roles?.includes(UserRole.ADMIN)) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-6">
        <Sidebar />
        <main className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage all users, sellers, delivery agents, and customers
              </p>
            </div>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pageInfo.totalElements}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sellers
                  </CardTitle>
                  <Store className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'SELLER').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All seller types</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Admins
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">System admins</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Farmers
                  </CardTitle>
                  <Sprout className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'SELLER' && u.shop?.sellerType === 'FARMER').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Own farm products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Retail Sellers
                  </CardTitle>
                  <Store className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'SELLER' && u.shop?.sellerType === 'RETAIL_SELLER').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Retail only</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Wholesalers
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-teal-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'SELLER' && u.shop?.sellerType === 'WHOLESALER').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Wholesale only</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Flexible Shops
                  </CardTitle>
                  <Store className="h-4 w-4 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'SELLER' && u.shop?.sellerType === 'SHOP').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Retail & wholesale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Delivery Agents
                  </CardTitle>
                  <Truck className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'DELIVERY_AGENT').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active drivers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Customers
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'CUSTOMER').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Shopping users</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all registered users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    Search
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                      <SelectItem value="DELIVERY_AGENT">Delivery Agent</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Seller Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {formatRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role === 'SELLER' && user.shop?.sellerType ? (
                              <Badge className={getSellerTypeBadgeColor(user.shop?.sellerType ?? '')}>
                                {formatSellerType(user.shop?.sellerType ?? '')}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.active ? 'default' : 'secondary'}>
                              {user.active ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleUserStatus(user.id, user.active)}
                              >
                                {user.active ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pageInfo.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {pageInfo.currentPage * pageInfo.pageSize + 1} to{' '}
                    {Math.min((pageInfo.currentPage + 1) * pageInfo.pageSize, pageInfo.totalElements)} of{' '}
                    {pageInfo.totalElements} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageInfo.currentPage === 0}
                      onClick={() => setPageInfo(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageInfo.currentPage >= pageInfo.totalPages - 1}
                      onClick={() => setPageInfo(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
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
