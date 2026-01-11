/**
 * Current User Information Endpoint - GET /api/auth/me
 * 
 * Returns information about the currently authenticated user from NextAuth session.
 * 
 * Security:
 * - Uses NextAuth getServerSession for server-side session validation
 * - Token expiration handled by NextAuth jwt() callback
 * - No manual refresh - NextAuth handles token lifecycle
 * - Cache-control headers (private, no-store)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getRequestLogger } from '@/lib/observability/logger';

/**
 * GET /api/auth/me
 * 
 * Returns current user information from NextAuth session
 * 
 * Response (200):
 * `json
 * {
 *   "id": "user-123",
 *   "email": "user@example.com",
 *   "name": "John Doe",
 *   "roles": ["customer"]
 * }
 * `
 * 
 * Response (401):
 * `json
 * {
 *   "error": "Unauthorized",
 *   "message": "No active session"
 * }
 * `
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = getRequestLogger(requestId);

  try {
    // Get NextAuth session from server-side
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      log.info('User info request - no session', { requestId });
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No active session',
        },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
            'X-Request-ID': requestId,
          },
        }
      );
    }

    // Build user data from NextAuth session
    const user = session.user as any;
    const userData = {
      id: user.id || user.sub,
      email: user.email,
      name: user.name,
      roles: (session as any).roles || [],
    };

    log.info('User info retrieved', { 
      requestId, 
      userId: userData.id,
    });

    return NextResponse.json(userData, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    log.error('Error fetching user info', { 
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch user information',
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          'X-Request-ID': requestId,
        },
      }
    );
  }
}
