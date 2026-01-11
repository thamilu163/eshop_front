/**
 * User Registration API Route - POST /api/auth/register
 * 
 * Proxies registration requests to Spring Boot backend with comprehensive security:
 * - Input validation (Zod schemas)
 * - CSRF protection (origin/referer validation)
 * - Request timeouts (10s default)
 * - Sanitized error responses and logging
 * - Request ID correlation
 * - Secure cookie management with dynamic expiry
 * - Audit logging (credentials never logged)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability/logger';

// ============================================================================
// Environment Configuration
// ============================================================================

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8082';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT_MS = parseInt(process.env.REGISTRATION_TIMEOUT_MS || '10000', 10);

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Registration request schema - strict validation
 */
const RegistrationRequestSchema = z.object({
  email: z.string().email('Invalid email format').max(254, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  firstName: z.string().min(1, 'First name required').max(100, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name required').max(100, 'Last name too long').optional(),
  phoneNumber: z.string().max(20, 'Phone number too long').optional(),
  acceptTerms: z.boolean().optional(),
}).strict(); // Reject extra fields

type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;

/**
 * Backend response schema - handles multiple token field naming conventions
 */
const BackendRegistrationResponseSchema = z.object({
  // Token fields (various naming conventions)
  token: z.string().optional(),
  accessToken: z.string().optional(),
  access_token: z.string().optional(),
  
  // Refresh token fields
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional(),
  
  // User data
  user: z.object({
    id: z.union([z.string(), z.number()]),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    roles: z.array(z.string()).optional(),
  }).optional(),
  
  // Token expiry (seconds)
  expiresIn: z.number().positive().optional(),
  expires_in: z.number().positive().optional(),
}).passthrough(); // Allow extra fields

type BackendRegistrationResponse = z.infer<typeof BackendRegistrationResponseSchema>;

// ============================================================================
// Error Messages (Generic, Safe for Client)
// ============================================================================

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid registration data',
  409: 'Email address already registered',
  422: 'Validation failed',
  429: 'Too many registration attempts. Please try again later.',
  500: 'Registration service unavailable',
  502: 'Registration service unavailable',
  503: 'Registration service temporarily unavailable',
  504: 'Request timeout. Please try again.',
};

// ============================================================================
// Helper Functions (Hoisted for Performance)
// ============================================================================

/**
 * Validates request origin for CSRF protection
 */
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // No origin/referer is suspicious for POST requests from browsers
  if (!origin && !referer) {
    // Allow for non-browser clients (mobile apps, etc.)
    return true;
  }
  
  try {
    const appOrigin = new URL(APP_URL).origin;
    
    if (origin) {
      return origin === appOrigin;
    }
    
    if (referer) {
      const refererOrigin = new URL(referer).origin;
      return refererOrigin === appOrigin;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Extracts tokens and user from backend response with type safety
 */
function extractRegistrationData(data: BackendRegistrationResponse) {
  // Extract access token (try all possible field names)
  const accessToken = 
    data.token ||
    data.accessToken ||
    data.access_token ||
    null;
  
  // Extract refresh token
  const refreshToken = 
    data.refreshToken ||
    data.refresh_token ||
    null;
  
  // Extract user data
  const user = data.user || null;
  
  // Extract token expiry (default to 24 hours)
  const expiresIn = 
    data.expiresIn ||
    data.expires_in ||
    86400; // 24 hours default
  
  return { accessToken, refreshToken, user, expiresIn };
}

/**
 * Sanitizes error response for client (never expose internal details)
 */
function sanitizeErrorForClient(status: number, requestId: string): { error: string; message: string; code: string; requestId: string } {
  const message = ERROR_MESSAGES[status] || 'Registration failed. Please try again.';
  return {
    error: message,
    message: 'Registration Error',
    code: status === 409 ? 'EMAIL_EXISTS' : status === 400 ? 'INVALID_DATA' : 'REGISTRATION_FAILED',
    requestId,
  };
}

/**
 * Sets authentication cookies with proper security settings
 */
function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string | null; refreshToken: string | null; expiresIn: number }
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieBase = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };
  
  // Set access token cookie with dynamic expiry from backend
  if (tokens.accessToken) {
    response.cookies.set('accessToken', tokens.accessToken, {
      ...cookieBase,
      maxAge: tokens.expiresIn,
    });
  }
  
  // Set refresh token cookie (longer expiry)
  if (tokens.refreshToken) {
    response.cookies.set('refreshToken', tokens.refreshToken, {
      ...cookieBase,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }
  
  // Set client-readable auth flag
  response.cookies.set('isAuthenticated', tokens.accessToken ? 'true' : 'false', {
    httpOnly: false, // Client needs to read this
    secure: isProduction,
    sameSite: 'strict' as const, // Stricter for non-httpOnly cookie
    path: '/',
    maxAge: tokens.expiresIn,
  });
}


// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Generate request ID for correlation across logs
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  
  try {
    // -------------------------------------------------------------------------
    // 1. Content-Type Validation
    // -------------------------------------------------------------------------
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      logger.warn('Registration rejected - invalid content type', { requestId, contentType });
      return NextResponse.json(
        { error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE', requestId },
        { 
          status: 415,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // -------------------------------------------------------------------------
    // 2. CSRF Protection (Origin/Referer Validation)
    // -------------------------------------------------------------------------
    if (!isValidOrigin(request)) {
      logger.warn('Registration rejected - invalid origin', { 
        requestId,
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      });
      return NextResponse.json(
        { error: 'Invalid request origin', code: 'INVALID_ORIGIN', requestId },
        { 
          status: 403,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // -------------------------------------------------------------------------
    // 3. Parse and Validate Request Body
    // -------------------------------------------------------------------------
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch (parseError) {
      logger.warn('Registration rejected - invalid JSON', { requestId });
      return NextResponse.json(
        { error: 'Invalid JSON in request body', code: 'INVALID_JSON', requestId },
        { 
          status: 400,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // Validate against schema
    const validation = RegistrationRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      logger.warn('Registration rejected - validation failed', { 
        requestId,
        errors: validation.error.issues.map(e => ({ path: e.path, message: e.message })),
      });
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
          requestId,
        },
        { 
          status: 400,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    const body: RegistrationRequest = validation.data;
    
    // -------------------------------------------------------------------------
    // 4. Forward Request to Backend with Timeout
    // -------------------------------------------------------------------------
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    let backendResponse: Response;
    try {
      // Extract client context for audit trail
      const clientIp = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-Forwarded-For': clientIp,
          'User-Agent': userAgent,
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          acceptTerms: body.acceptTerms,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.error('Registration timeout', { requestId, timeout: REQUEST_TIMEOUT_MS });
        return NextResponse.json(
          sanitizeErrorForClient(504, requestId),
          { 
            status: 504,
            headers: { 
              'X-Request-ID': requestId,
              'Retry-After': '30', // Suggest retry after 30 seconds
            },
          }
        );
      }
      
      // Handle network errors
      logger.error('Backend connection failed', { 
        requestId,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      });
      return NextResponse.json(
        sanitizeErrorForClient(502, requestId),
        { 
          status: 502,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // -------------------------------------------------------------------------
    // 5. Handle Backend Error Responses
    // -------------------------------------------------------------------------
    if (!backendResponse.ok) {
      const status = backendResponse.status;
      
      // Log failure (email only, never password)
      logger.warn('Registration failed', { 
        requestId,
        email: body.email,
        status,
        statusText: backendResponse.statusText,
      });
      
      // Pass through rate limit headers if present
      const headers: Record<string, string> = { 'X-Request-ID': requestId };
      const rateLimitRemaining = backendResponse.headers.get('x-ratelimit-remaining');
      const rateLimitReset = backendResponse.headers.get('x-ratelimit-reset');
      if (rateLimitRemaining) {
        headers['X-RateLimit-Remaining'] = rateLimitRemaining;
      }
      if (rateLimitReset) {
        headers['X-RateLimit-Reset'] = rateLimitReset;
      }
      
      return NextResponse.json(
        sanitizeErrorForClient(status, requestId),
        { status, headers }
      );
    }
    
    // -------------------------------------------------------------------------
    // 6. Parse and Validate Backend Response
    // -------------------------------------------------------------------------
    let backendData: unknown;
    try {
      backendData = await backendResponse.json();
    } catch (jsonError) {
      logger.error('Backend response parse failed', { requestId });
      return NextResponse.json(
        sanitizeErrorForClient(502, requestId),
        { 
          status: 502,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // Validate backend response structure
    const responseValidation = BackendRegistrationResponseSchema.safeParse(backendData);
    if (!responseValidation.success) {
      logger.error('Backend response validation failed', { 
        requestId,
        errors: responseValidation.error.issues,
      });
      return NextResponse.json(
        sanitizeErrorForClient(502, requestId),
        { 
          status: 502,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // Extract tokens and user data
    const { accessToken, refreshToken, user, expiresIn } = extractRegistrationData(responseValidation.data);
    
    // Verify we got at least an access token
    if (!accessToken) {
      logger.error('Backend response missing access token', { requestId });
      return NextResponse.json(
        sanitizeErrorForClient(502, requestId),
        { 
          status: 502,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
    
    // -------------------------------------------------------------------------
    // 7. Log Success (Email Only, Never Credentials or Tokens)
    // -------------------------------------------------------------------------
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Registration successful', { 
        requestId,
        email: body.email,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        expiresIn,
      });
    } else {
      logger.info('Registration successful', { 
        requestId,
        email: body.email,
      });
    }
    
    // -------------------------------------------------------------------------
    // 8. Set Cookies and Return Success Response
    // -------------------------------------------------------------------------
    const nextResponse = NextResponse.json(
      { 
        user, 
        success: true,
        requestId,
      },
      { 
        status: 201,
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'X-Request-ID': requestId,
        },
      }
    );
    
    // Set authentication cookies with dynamic expiry
    setAuthCookies(nextResponse, { accessToken, refreshToken, expiresIn });
    
    return nextResponse;
    
  } catch (error: unknown) {
    // -------------------------------------------------------------------------
    // 9. Catch-All Error Handler
    // -------------------------------------------------------------------------
    // Log error WITHOUT request body (could contain password)
    logger.error('Registration unexpected error', { 
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      sanitizeErrorForClient(500, requestId),
      { 
        status: 500,
        headers: { 'X-Request-ID': requestId },
      }
    );
  }
}

// ============================================================================
// Next.js Configuration
// ============================================================================

/**
 * Force dynamic rendering - never cache this endpoint
 */
export const dynamic = 'force-dynamic';

/**
 * Use Node.js runtime
 */
export const runtime = 'nodejs';
