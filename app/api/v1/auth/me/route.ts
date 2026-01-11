import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
const BACKEND_API_URL = process.env.BACKEND_API_URL || API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const response = await axios.get(`${BACKEND_API_URL}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    logger.error('v1 me proxy error:', (error as Record<string, unknown>).response || (error as Error).message);
    return NextResponse.json({ error: ((error as Record<string, unknown>).response as Record<string, unknown>)?.data || 'Failed to fetch profile' }, { status: ((error as Record<string, unknown>).response as Record<string, unknown>)?.status as number || 500 });
  }
}
