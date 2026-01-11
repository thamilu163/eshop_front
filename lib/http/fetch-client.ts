export async function tokenExchange(endpoint: string, params: URLSearchParams, correlationId?: string): Promise<unknown> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(correlationId ? { 'X-Correlation-ID': correlationId } : {}),
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`token exchange failed: ${res.status} ${body}`);
  }

  return res.json();
}
