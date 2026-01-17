/**
 * Next.js Proxy with NextAuth Protection (Next.js 16+)
 *
 * Renamed from middleware.ts to proxy.ts following Next.js 16 conventions.
 * Single source of truth for authentication and role-based routing.
 * Prevents redirect loops by handling all redirects here.
 *
 * @module proxy
 */

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/observability/logger';

/**
 * Generate a random CSP nonce for inline scripts/styles
 */
function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  logger.debug('[proxy] Request received', { pathname });

  // CRITICAL: Skip proxy for public routes and static assets
  // This prevents redirect loops
  const shouldSkipProxy =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/.well-known/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|json|webmanifest)$/);

  if (shouldSkipProxy) {
    logger.debug('[proxy] Skipping - public route or static asset', { pathname });
    return NextResponse.next();
  }

  // Generate CSP nonce for security headers
  const nonce = generateNonce();
  const response = NextResponse.next();
  
  // Add CSP nonce to response headers (available in layout.tsx)
  response.headers.set('x-csp-nonce', nonce);

  // Define public routes that don't require authentication (industry standard for ecommerce)
  const publicRoutes = [
    '/',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/help',
    '/terms',
    '/privacy',
    '/search',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`)
  );

  // Check authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  logger.debug('[proxy] Authentication check', {
    pathname,
    hasToken: !!token,
    isPublicRoute,
  });

  // Allow public routes without authentication (guest browsing)
  if (isPublicRoute && !token) {
    logger.debug('[proxy] Public route access granted', { pathname, authenticated: false });
    return response;
  }

  // Not logged in and not a public route → redirect to login
  if (!token) {
    logger.info('[proxy] Redirecting to login', { pathname, reason: 'unauthenticated' });
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user roles from token
  const roles = (token as any).roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSeller = roles.includes('SELLER');
  const isDeliveryAgent = roles.includes('DELIVERY_AGENT');

  logger.debug('[proxy] User authenticated', {
    pathname,
    email: token.email,
    roles,
    isAdmin,
    isSeller,
    isDeliveryAgent,
  });

  // Role-based access control for protected routes
  if (pathname.startsWith('/seller')) {
    if (!isSeller) {
      logger.warn('[proxy] Access denied - insufficient permissions', {
        pathname,
        email: token.email,
        requiredRole: 'SELLER',
        userRoles: roles,
      });
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
    logger.debug('[proxy] SELLER access granted', { pathname, email: token.email });
  }

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      logger.warn('[proxy] Access denied - insufficient permissions', {
        pathname,
        email: token.email,
        requiredRole: 'ADMIN',
        userRoles: roles,
      });
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
    logger.debug('[proxy] ADMIN access granted', { pathname, email: token.email });
  }

  if (pathname.startsWith('/delivery')) {
    if (!isDeliveryAgent) {
      logger.warn('[proxy] Access denied - insufficient permissions', {
        pathname,
        email: token.email,
        requiredRole: 'DELIVERY_AGENT',
        userRoles: roles,
      });
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
    logger.debug('[proxy] DELIVERY_AGENT access granted', { pathname, email: token.email });
  }

  // Role-based redirects - ONLY from home page
  if (isAdmin && pathname === '/') {
    logger.info('[proxy] Role-based redirect', { email: token.email, role: 'ADMIN', target: '/admin' });
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  if (isSeller && pathname === '/') {
    logger.info('[proxy] Role-based redirect', { email: token.email, role: 'SELLER', target: '/seller' });
    return NextResponse.redirect(new URL('/seller', req.url));
  }

  if (isDeliveryAgent && pathname === '/') {
    logger.info('[proxy] Role-based redirect', { email: token.email, role: 'DELIVERY_AGENT', target: '/delivery' });
    return NextResponse.redirect(new URL('/delivery', req.url));
  }

  logger.debug('[proxy] Access allowed', { pathname, email: token.email });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths
     * Exclusions are handled in the proxy function itself
     */
    '/(.*)',
  ],
};
