/**
 * Helper API route to get access token from NextAuth session
 * This is needed because NextAuth doesn't expose accessToken to client by default
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get server-side session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Access the token from the JWT (server-side only)
    // Note: This requires the jwt() callback to store accessToken in the token
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      // If not in session, we need to get it from the JWT callback
      // For now, return the session to help debug
      return NextResponse.json({
        message: 'Access token not found in session',
        sessionData: {
          user: session.user,
          roles: (session as any).roles,
          expiresAt: (session as any).expiresAt,
        },
      });
    }

    return NextResponse.json({
      accessToken,
      expiresAt: (session as any).expiresAt,
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
