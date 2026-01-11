import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/types';
import { RATE_LIMITS, checkRateLimit } from '@/lib/security/rate-limiter';

interface TokenPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
}

function parseJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: TokenPayload): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/categories',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const;

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMIN],
  '/seller': [UserRole.ADMIN, UserRole.SELLER],
  '/orders': [UserRole.ADMIN, UserRole.CUSTOMER, UserRole.SELLER],
  '/profile': [UserRole.ADMIN, UserRole.CUSTOMER, UserRole.SELLER, UserRole.DELIVERY_AGENT],
  '/cart': [UserRole.CUSTOMER],
  '/checkout': [UserRole.CUSTOMER],
  '/wishlist': [UserRole.CUSTOMER],
};

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) return true;
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return roles;
    }
  }
  return null;
}

function createUnauthorizedResponse(request: NextRequest, message: string) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  if (isApiRoute) {
    return NextResponse.json({ message, status: 401 }, { status: 401 });
  }
  // Sanitize callback target to avoid redirecting back to sign-in or API routes
  const loginUrl = new URL('/auth/signin', request.url);
  let callbackTarget = request.nextUrl.pathname;
  const lower = callbackTarget.toLowerCase();
  // Never redirect back to API/auth endpoints or the sign-in page itself
  if (
    lower === '/auth/signin' ||
    lower === '/login' ||
    lower.startsWith('/api/auth') ||
    lower.startsWith('/api') ||
    lower.startsWith('/_next') ||
    callbackTarget.length > 200
  ) {
    callbackTarget = '/';
  }
  loginUrl.searchParams.set('callbackUrl', callbackTarget);
  loginUrl.searchParams.set('error', 'unauthorized');
  return NextResponse.redirect(loginUrl);
}

function createForbiddenResponse(request: NextRequest, message: string) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  if (isApiRoute) {
    return NextResponse.json({ message, status: 403 }, { status: 403 });
  }
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}

export async function handleProxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // During local development, rewrite missing/placeholder image requests
  // to a single placeholder to avoid repeated 404s from next/image.
  // This is intentionally development-only and safe to remove in CI/production.
  if (process.env.NODE_ENV === 'development') {
    if (
      pathname.startsWith('/images/') ||
      pathname === '/icon-192x192.png' ||
      pathname === '/promo-banner.png' ||
      pathname === '/app-download.png'
    ) {
      // Return a tiny 1x1 PNG placeholder directly to avoid next/image SVG restrictions
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
      const body = Buffer.from(pngBase64, 'base64');
      const response = new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      });
      return response;
    }
  }

  // Bypass next internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static assets
  ) {
    return NextResponse.next();
  }

  // Allow auth API routes to function without proxy enforcement
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  const payload = token ? parseJwtPayload(token) : null;
  const isAuthenticated = payload && !isTokenExpired(payload);

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return createUnauthorizedResponse(request, 'Authentication required');
  }

  // Rate limit check for auth-sensitive routes
  try {
    const id = request.headers.get('x-forwarded-for') || 'anon';
    checkRateLimit(id, RATE_LIMITS.auth);
  } catch {
    // If rate limit exceeded, return 429
    return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
  }

  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && payload) {
    if (!requiredRoles.includes(payload.role)) {
      return createForbiddenResponse(request, `Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }
  }

  // Inject user headers for server components
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload?.sub ?? '');
  response.headers.set('x-user-role', payload?.role ?? '');
  return response;
}

export default handleProxy;
