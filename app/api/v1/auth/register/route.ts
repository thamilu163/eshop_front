import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
const BACKEND_API_URL = process.env.BACKEND_API_URL || API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(`${BACKEND_API_URL}/api/v1/auth/register`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    const respData = response.data ?? {};
    const accessToken = respData.token ?? respData.accessToken ?? respData.access_token ?? respData.data?.token ?? null;
    const refreshToken = respData.refreshToken ?? respData.refresh_token ?? respData.data?.refresh_token ?? null;
    const user = respData.user ?? respData.data?.user ?? null;

    const nextRes = NextResponse.json({ user, success: true }, { status: 201 });

    if (accessToken) {
      nextRes.cookies.set('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });
    }
    if (refreshToken) {
      nextRes.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' });
    }
    nextRes.cookies.set('isAuthenticated', accessToken ? 'true' : 'false', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60, path: '/' });

    return nextRes;
  } catch (error: unknown) {
    logger.error('v1 register proxy error:', (error as Record<string, unknown>).response || (error as Error).message);
    return NextResponse.json({ error: ((error as Record<string, unknown>).response as Record<string, unknown>)?.data || 'Registration failed' }, { status: ((error as Record<string, unknown>).response as Record<string, unknown>)?.status as number || 500 });
  }
}
