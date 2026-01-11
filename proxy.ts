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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('🔥 [Proxy] Executing for:', pathname);

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
    console.log('[Proxy] ✅ Skipping proxy - public route or static asset');
    return NextResponse.next();
  }

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

  console.log('[Proxy] Token check:', token ? '✅ exists' : '❌ missing');
  console.log('[Proxy] Is public route:', isPublicRoute);

  // Allow public routes without authentication (guest browsing)
  if (isPublicRoute && !token) {
    console.log('[Proxy] ✅ Public route - allowing unauthenticated access for guest browsing');
    return NextResponse.next();
  }

  // Not logged in and not a public route → redirect to login
  if (!token) {
    console.log('[Proxy] ❌ No token, redirecting to login');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user roles from token
  const roles = (token as any).roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSeller = roles.includes('SELLER');

  console.log('[Proxy] User:', token.email);
  console.log('[Proxy] Roles:', roles.length > 0 ? roles.join(', ') : 'none');
  console.log('[Proxy] isAdmin:', isAdmin);
  console.log('[Proxy] isSeller:', isSeller);

  // Role-based access control for protected routes
  if (pathname.startsWith('/seller')) {
    if (!isSeller) {
      console.log('[Proxy] ❌ Access denied - not a SELLER, redirecting to /access-denied');
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
    console.log('[Proxy] ✅ SELLER access granted');
  }

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      console.log('[Proxy] ❌ Access denied - not an ADMIN, redirecting to /access-denied');
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
    console.log('[Proxy] ✅ ADMIN access granted');
  }

  // Role-based redirects - ONLY for ADMIN and SELLER from home page
  // Let client-side RoleBasedRedirect handle CUSTOMER redirects
  if (isAdmin && pathname === '/') {
    console.log('[Proxy] Redirecting ADMIN to /admin');
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  if (isSeller && !isAdmin && pathname === '/') {
    console.log('[Proxy] Redirecting SELLER to /seller');
    return NextResponse.redirect(new URL('/seller', req.url));
  }

  console.log('[Proxy] ✅ Access allowed, continuing');
  return NextResponse.next();
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
