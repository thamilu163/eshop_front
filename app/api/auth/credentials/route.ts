import { NextRequest } from 'next/server';
import { z } from 'zod';
import { loadAuthConfig, getTokenEndpoint } from '@/lib/auth/config';
import { createSession, type SessionData } from '@/lib/auth/session';
import { validateIdToken } from '@/lib/auth/tokens';
import { getRequestLogger } from '@/lib/observability/logger';
import {
  apiError,
  apiSuccess,
  validateOrigin,
  isValidRedirectPath,
  createTimeoutController,
  API_ERROR_CODES,
} from '@/lib/api/response-helpers';
import {
  parseTokenResponse,
  parseErrorResponse,
  DEFAULT_TOKEN_EXPIRY_SECONDS,
} from '@/lib/auth/token-schemas';

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

/**
 * Credentials Login API Route
 * 
 * ⚠️ SECURITY NOTE: This endpoint uses Resource Owner Password Credentials (ROPC) grant,
 * which is deprecated by OAuth 2.0 Security BCP (RFC 9700). This should only be used for:
 * - First-party mobile apps with no browser
 * - Legacy system migration (with deprecation plan)
 * 
 * Consider migrating to Authorization Code Flow + PKCE for better security.
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = performance.now();
  const log = getRequestLogger('credentials-login');

  // Add request ID to log context
  log.info('Processing credentials login', { requestId });

  // CSRF Protection: Validate Origin header
  const origin = req.headers.get('origin');
  if (!validateOrigin(origin)) {
    log.warn('CSRF validation failed', { origin, requestId });
    return apiError(
      'Invalid origin',
      API_ERROR_CODES.CSRF_VALIDATION_FAILED,
      403,
      requestId
    );
  }

  // Content-Type validation
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return apiError(
      'Invalid content type',
      API_ERROR_CODES.INVALID_CONTENT_TYPE,
      415,
      requestId
    );
  }

  // Parse and validate request body
  let body: z.infer<typeof BodySchema>;
  try {
    const json = await req.json();
    body = BodySchema.parse(json);
  } catch (err) {
    log.warn('Invalid request body', { error: err, requestId });
    return apiError(
      'Invalid request body',
      API_ERROR_CODES.INVALID_REQUEST_BODY,
      400,
      requestId
    );
  }

  // Destructure sensitive fields immediately to prevent accidental exposure
  const { username, password, redirectTo } = body;
  // Never reference `body` after this point to avoid password leakage

  // Validate authentication configuration
  const config = loadAuthConfig();
  if (!config) {
    log.error('Auth configuration missing', { requestId });
    return apiError(
      'Authentication not configured',
      API_ERROR_CODES.AUTH_NOT_CONFIGURED,
      500,
      requestId
    );
  }

  // Validate redirect path
  const safeRedirectTo =
    redirectTo && isValidRedirectPath(redirectTo) ? redirectTo : '/';
  if (redirectTo && !isValidRedirectPath(redirectTo)) {
    log.warn('Invalid redirect path provided', { redirectTo, requestId });
  }

  // Build token request (Resource Owner Password Credentials Grant)
  const tokenEndpoint = getTokenEndpoint(config);
  const params = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
    client_id: config.clientId,
    scope: 'openid profile email',
  });

  if (config.clientSecret) {
    params.set('client_secret', config.clientSecret);
  }

  // Create timeout controller (10 second timeout for IdP requests)
  const { controller, cleanup } = createTimeoutController(10_000);
  const idpStart = performance.now();

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
    });

    cleanup();
    const idpDuration = performance.now() - idpStart;

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      log.warn('Rate limited by IdP', { requestId, retryAfter });
      return apiError(
        'Too many login attempts',
        API_ERROR_CODES.RATE_LIMITED,
        429,
        requestId,
        { retryAfter }
      );
    }

    const responseData = await response.json();

    if (!response.ok) {
      const errorInfo = parseErrorResponse(responseData);
      log.warn('Token endpoint returned error', {
        status: response.status,
        error: errorInfo?.error,
        description: errorInfo?.error_description,
        requestId,
      });
      return apiError('Invalid credentials', API_ERROR_CODES.INVALID_CREDENTIALS, 401, requestId);
    }

    // Parse and validate token response structure
    const tokenResult = parseTokenResponse(responseData);
    if (!tokenResult.success) {
      log.error('Invalid token response structure', {
        error: tokenResult.error,
        requestId,
      });
      return apiError(
        'Invalid token response from authentication server',
        API_ERROR_CODES.INVALID_TOKEN_RESPONSE,
        502,
        requestId
      );
    }

    const tokenData = tokenResult.data;

    // ID token is required for OIDC
    if (!tokenData.id_token) {
      log.error('Token response missing id_token', { requestId });
      return apiError(
        'Invalid token response',
        API_ERROR_CODES.INVALID_TOKEN_RESPONSE,
        502,
        requestId
      );
    }

    // Validate ID token
    const validation = await validateIdToken(tokenData.id_token);
    if (!validation.valid || !validation.payload) {
      log.error('ID token validation failed', {
        error: validation.error,
        code: validation.errorCode,
        requestId,
      });
      return apiError(
        'ID token validation failed',
        API_ERROR_CODES.ID_TOKEN_VALIDATION_FAILED,
        502,
        requestId
      );
    }

    // Build properly typed session object
    const expiresIn = tokenData.expires_in ?? DEFAULT_TOKEN_EXPIRY_SECONDS;
    const sessionData: SessionData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresAt: Date.now() + expiresIn * 1000,
      userId: validation.payload.sub,
      email: validation.payload.email ?? undefined,
      name: validation.payload.name ?? validation.payload.preferred_username ?? undefined,
      roles: validation.payload.realm_access?.roles ?? [],
    };

    // Create secured session cookie
    await createSession(sessionData);

    const totalDuration = performance.now() - start;

    // Successful login response with timing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fullUrl = new URL(safeRedirectTo, baseUrl);

    log.info('Login successful', {
      userId: sessionData.userId,
      requestId,
      duration: totalDuration.toFixed(0),
    });

    return apiSuccess(
      {
        redirectTo: fullUrl.pathname + fullUrl.search,
      },
      requestId,
      {
        timing: {
          total: totalDuration,
          idp: idpDuration,
        },
      }
    );
  } catch (error: unknown) {
    cleanup();

    // Handle timeout specifically
    if (error instanceof DOMException && error.name === 'AbortError') {
      log.error('IdP request timeout', { requestId });
      return apiError(
        'Authentication service timeout',
        API_ERROR_CODES.IDP_TIMEOUT,
        504,
        requestId
      );
    }

    const errMsg = error instanceof Error ? error.message : String(error);
    log.error('Credentials login error', { error: errMsg, requestId });
    return apiError('Internal server error', API_ERROR_CODES.INTERNAL_ERROR, 500, requestId);
  }
}
