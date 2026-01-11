/**
 * Application Routes Constants
 * Centralized route definitions
 */

export const APP_ROUTES = {
  HOME: '/',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  
  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  
  // User
  PROFILE: '/settings',
  WISHLIST: '/wishlist',
  
  // Seller
  SELLER: {
    DASHBOARD: '/seller',
    PRODUCTS: '/seller/products',
    ADD_PRODUCT: '/seller/products/add',
    EDIT_PRODUCT: (id: string) => `/seller/products/${id}/edit`,
    ORDERS: '/seller/orders',
    ANALYTICS: '/seller/analytics',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    CATEGORIES: '/admin/categories',
    ANALYTICS: '/admin/analytics',
  },
  
  // Delivery
  DELIVERY: {
    DASHBOARD: '/delivery',
    ORDERS: '/delivery/orders',
    ORDER_DETAIL: (id: string) => `/delivery/orders/${id}`,
  },
  
  // Error Pages
  NOT_FOUND: '/404',
  ACCESS_DENIED: '/403',
  SERVER_ERROR: '/500',
} as const;

export type AppRoutes = typeof APP_ROUTES;
