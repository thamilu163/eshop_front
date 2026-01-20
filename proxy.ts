/**
 * Next.js Proxy with NextAuth Protection (Next.js 16+)
 * 
 * Single source of truth for authentication and role-based routing.
 * Handles RBAC, CSP headers, redirects, and rate limiting.
 * Renamed from middleware.ts to proxy.ts per project conventions.
 */

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/observability/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

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
    return NextResponse.next();
  }

  // Generate CSP nonce
  const nonce = generateNonce();
  const response = NextResponse.next();
  response.headers.set('x-csp-nonce', nonce);

  // Allow public routes without authentication
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

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isPublicRoute && !token) {
    return response;
  }

  if (!token) {
    logger.info('[proxy] Redirecting to login', { pathname });
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rate Limiting (Applied to authenticated/protected traffic)
  // Using 'x-forwarded-for' or falling back to 'anon'.
  // In production, ensure your reverse proxy (Vercel/Cloudflare) standardizes this header.
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    
    // STRICT limit for auth routes (login, register, session)
    // RELAXED limit for general API (dashboard data, products, etc)
    const isAuthApi = pathname.startsWith('/api/auth') || pathname.startsWith('/auth');
    const limitConfig = isAuthApi ? RATE_LIMITS.auth : RATE_LIMITS.authenticated;
    
    const rateLimitResult = checkRateLimit(ip, limitConfig);
    
    if (!rateLimitResult.allowed) {
        logger.warn('[proxy] Rate limit exceeded', { ip, pathname });
        return NextResponse.json(
            { message: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
            { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
        );
    }
  } catch (error) {
    // Fail safe: If rate limiting throws, log it but don't block the request unless critical
    logger.error('[proxy] Rate limit error', { error });
  }

  // Role-based access control
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = (token as any).roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSeller = roles.includes('SELLER');
  const isDeliveryAgent = roles.includes('DELIVERY_AGENT');

  if (pathname.startsWith('/seller') && !isSeller) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/delivery') && !isDeliveryAgent) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Role-based home redirects - only redirect from root path
  // DO NOT redirect from /admin/* routes - allow all admin sub-routes
  if (pathname === '/') {
    if (isAdmin) return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    if (isSeller) return NextResponse.redirect(new URL('/seller', req.url));
    if (isDeliveryAgent) return NextResponse.redirect(new URL('/delivery', req.url));
  }

  // Redirect /admin (without subpath) to dashboard
  // This allows /admin/users, /admin/products, etc. to work normally
  if (pathname === '/admin' && isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/(.*)',
  ],
};
