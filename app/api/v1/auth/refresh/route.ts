import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
const BACKEND_API_URL = process.env.BACKEND_API_URL || API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

    const response = await axios.post(`${BACKEND_API_URL}/api/v1/auth/refresh`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } });
    const resp = response.data ?? {};

    const newAccess = resp.token ?? resp.accessToken ?? resp.access_token ?? resp.data?.token ?? null;
    const newRefresh = resp.refreshToken ?? resp.refresh_token ?? resp.data?.refresh_token ?? null;

    const nextRes = NextResponse.json({ success: true }, { status: 200 });
    if (newAccess) nextRes.cookies.set('accessToken', newAccess, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });
    if (newRefresh) nextRes.cookies.set('refreshToken', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' });
    nextRes.cookies.set('isAuthenticated', newAccess ? 'true' : 'false', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });
    return nextRes;
  } catch (error: unknown) {
    logger.error('v1 refresh proxy error:', (error as Record<string, unknown>).response || (error as Error).message);
    const r = NextResponse.json({ error: ((error as Record<string, unknown>).response as Record<string, unknown>)?.data || 'Refresh failed' }, { status: ((error as Record<string, unknown>).response as Record<string, unknown>)?.status as number || 500 });
    r.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    r.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    r.cookies.set('isAuthenticated', '', { maxAge: 0, path: '/' });
    return r;
  }
}
