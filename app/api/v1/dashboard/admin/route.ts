import { NextResponse } from 'next/server';
import type { AdminDashboardData } from '@/types/dashboard';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const now = new Date();

  const data: AdminDashboardData = {
    overview: {
      totalUsers: 12543,
      totalOrders: 4521,
      totalRevenue: 543210.50,
      pendingOrders: 15,
      totalProducts: 120,
      totalShops: 45,
      completedOrders: 4200,
      cancelledOrders: 306,
      averageOrderValue: 120.15,
    },
    userStats: {
      newUsersThisMonth: 120,
      newUsersLastMonth: 90,
      activeUsers: 8432,
      churnRate: 2.1,
      growthRate: 5.2,
    },
    recentOrders: [
      {
        id: 'ORD-7782',
        orderNumber: 'ORD-7782',
        customerName: 'Alice Smith',
        customerEmail: 'alice@example.com',
        customerAvatar: 'https://via.placeholder.com/150',
        amount: 350.00,
        currency: 'USD',
        status: 'DELIVERED',
        itemCount: 3,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'ORD-7783',
        orderNumber: 'ORD-7783',
        customerName: 'Bob Jones',
        customerEmail: 'bob@example.com',
        amount: 85.50,
        currency: 'USD',
        status: 'PENDING',
        itemCount: 1,
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: 'ORD-7784',
        orderNumber: 'ORD-7784',
        customerName: 'Charlie Brown',
        customerEmail: 'charlie@example.com',
        amount: 1240.25,
        currency: 'USD',
        status: 'PROCESSING',
        itemCount: 5,
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
        updatedAt: new Date(now.getTime() - 7200000).toISOString(),
      },
      {
        id: 'ORD-7785',
        orderNumber: 'ORD-7785',
        customerName: 'David Wilson',
        customerEmail: 'david@example.com',
        amount: 99.99,
        currency: 'USD',
        status: 'CANCELLED',
        itemCount: 2,
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 86400000).toISOString(),
      },
      {
        id: 'ORD-7786',
        orderNumber: 'ORD-7786',
        customerName: 'Eva Green',
        customerEmail: 'eva@example.com',
        amount: 450.00,
        currency: 'USD',
        status: 'DELIVERED',
        itemCount: 3,
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
        updatedAt: new Date(now.getTime() - 172800000).toISOString(),
      }
    ],
    paymentAnalytics: {
      successRate: 98.5,
      failedTransactions: 15,
      totalTransactions: 4500,
      totalVolume: 543210.50,
      averageTransactionValue: 120.71,
      methods: [
        { method: 'card', displayName: 'Credit Card', percentage: 65, transactions: 2925, volume: 353086.82 },
        { method: 'paypal', displayName: 'PayPal', percentage: 25, transactions: 1125, volume: 135802.63 },
        { method: 'bank', displayName: 'Bank Transfer', percentage: 10, transactions: 450, volume: 54321.05 }
      ]
    },
    alerts: [
        {
            id: 'ALT-001',
            type: 'warning',
            title: 'High Server Load',
            message: 'CPU usage exceeded 80%',
            timestamp: new Date(now.getTime() - 900000).toISOString(),
            isRead: false
        },
        {
            id: 'ALT-002',
            type: 'success',
            title: 'Backup Completed',
            message: 'Daily database backup finished successfully',
            timestamp: new Date(now.getTime() - 3600000).toISOString(),
            isRead: true
        }
    ],
    inventoryAlerts: [
        {
            id: 'INV-001',
            productId: 'PROD-123',
            productName: 'Gaming Mouse',
            currentStock: 2,
            threshold: 10,
            status: 'critical',
            sku: 'GM-500'
        },
        {
            id: 'INV-002',
            productId: 'PROD-456',
            productName: 'Mechanical Keyboard',
            currentStock: 8,
            threshold: 15,
            status: 'low',
            sku: 'MK-800'
        }
    ],
    topProducts: [
        { id: 'PROD-123', name: 'Gaming Mouse', sales: 1200, revenue: 60000, growth: 15 },
        { id: 'PROD-456', name: 'Mechanical Keyboard', sales: 850, revenue: 127500, growth: 8 },
        { id: 'PROD-789', name: '4K Monitor', sales: 400, revenue: 200000, growth: 12 }
    ],
    revenueData: [
        { date: 'Mon', revenue: 4000, orders: 45, averageOrderValue: 88.88 },
        { date: 'Tue', revenue: 3000, orders: 32, averageOrderValue: 93.75 },
        { date: 'Wed', revenue: 2000, orders: 25, averageOrderValue: 80.00 },
        { date: 'Thu', revenue: 2780, orders: 30, averageOrderValue: 92.66 },
        { date: 'Fri', revenue: 1890, orders: 20, averageOrderValue: 94.50 },
        { date: 'Sat', revenue: 2390, orders: 28, averageOrderValue: 85.35 },
        { date: 'Sun', revenue: 3490, orders: 40, averageOrderValue: 87.25 },
    ],
    lastUpdated: now.toISOString()
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
