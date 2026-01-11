import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
const BACKEND_API_URL = process.env.BACKEND_API_URL || API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    // forward logout to backend (may accept refresh token or rely on server invalidation)
    const refreshToken = request.cookies.get('refreshToken')?.value;
    await axios.post(`${BACKEND_API_URL}/api/v1/auth/logout`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } });

    const res = NextResponse.json({ success: true }, { status: 200 });
    // clear cookies
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('isAuthenticated', '', { maxAge: 0, path: '/' });
    return res;
  } catch (error: unknown) {
    logger.error('v1 logout proxy error:', (error as Record<string, unknown>).response || (error as Error).message);
    const res = NextResponse.json({ error: ((error as Record<string, unknown>).response as Record<string, unknown>)?.data || 'Logout failed' }, { status: ((error as Record<string, unknown>).response as Record<string, unknown>)?.status as number || 500 });
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('isAuthenticated', '', { maxAge: 0, path: '/' });
    return res;
  }
}
