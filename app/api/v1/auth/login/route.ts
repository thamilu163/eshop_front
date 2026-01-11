import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
const BACKEND_API_URL = process.env.BACKEND_API_URL || API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to backend v1 login endpoint
    const response = await axios.post(`${BACKEND_API_URL}/api/v1/auth/login`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    const respData = response.data ?? {};

    const accessToken = respData.token ?? respData.accessToken ?? respData.access_token ?? respData.data?.token ?? respData.data?.access_token ?? null;
    const refreshToken = respData.refreshToken ?? respData.refresh_token ?? respData.data?.refreshToken ?? respData.data?.refresh_token ?? null;
    const user = respData.user ?? respData.data?.user ?? respData.userInfo ?? respData.data ?? null;

    if (process.env.NODE_ENV === 'development') {
      console.log('v1 login proxy - backend response keys:', Object.keys(respData));
    }

    const nextResponse = NextResponse.json({ user, success: true }, { status: 200 });

    if (accessToken) {
      nextResponse.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });
    }

    if (refreshToken) {
      nextResponse.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    nextResponse.cookies.set('isAuthenticated', accessToken ? 'true' : 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return nextResponse;
  } catch (err: any) {
    console.error('v1 login proxy error:', err);
    const respData = err?.response?.data || null;
    const message = respData?.title || err?.message || 'Authentication Error';
    const status = err?.response?.status || 500;
    return NextResponse.json(
      {
        error: respData || err?.message || 'Login failed',
        message,
        status,
      },
      { status }
    );
  }
}
