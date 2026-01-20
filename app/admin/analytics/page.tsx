import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Admin',
  description: 'Dashboard analytics overview',
};

// Server Component: fetch multiple analytics endpoints in parallel
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

type Metrics = {
  revenue: { total: number; period: string };
  orders: { count: number; period: string };
  activeUsers: { count: number; period: string };
  topProducts: Array<{ id: string; name: string; sales: number }>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} - ${res.status}`);
  }
  return res.json();
}

async function loadAnalytics(): Promise<Partial<Metrics>> {
  if (!API_BASE) {
    // Avoid external network calls during build if API base isn't configured
    return {}
  }

  const endpoints = {
    revenue: `${API_BASE}/api/v1/analytics/revenue`,
    orders: `${API_BASE}/api/v1/analytics/orders`,
    activeUsers: `${API_BASE}/api/v1/analytics/active-users`,
    topProducts: `${API_BASE}/api/v1/analytics/top-products`,
  };

  const tasks = Object.entries(endpoints).map(async ([key, url]) => {
    try {
      const payload = await fetchJson(url);
      return [key, payload] as const;
    } catch (_err) {
      // Return null for that metric but keep others
      return [key, null] as const;
    }
  });

  const results = await Promise.all(tasks);
  return results.reduce((acc, [k, v]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (v !== null) (acc as any)[k] = v;
    return acc;
  }, {} as Partial<Metrics>);
}

export default async function AnalyticsPage() {
  const data = await loadAnalytics();

  const revenue = data.revenue ?? { total: 0, period: 'N/A' };
  const orders = data.orders ?? { count: 0, period: 'N/A' };
  const activeUsers = data.activeUsers ?? { count: 0, period: 'N/A' };
  const topProducts = data.topProducts ?? [];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Analytics Overview</h1>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-md">
          <p className="text-sm text-gray-500">Revenue ({revenue.period})</p>
          <p className="text-2xl font-bold">${revenue.total.toLocaleString()}</p>
        </div>

        <div className="p-4 border rounded-md">
          <p className="text-sm text-gray-500">Orders ({orders.period})</p>
          <p className="text-2xl font-bold">{orders.count}</p>
        </div>

        <div className="p-4 border rounded-md">
          <p className="text-sm text-gray-500">Active Users ({activeUsers.period})</p>
          <p className="text-2xl font-bold">{activeUsers.count}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Top Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">No data available</p>
        ) : (
          <ul className="space-y-2">
            {topProducts.map(p => (
              <li key={p.id} className="flex justify-between p-2 border rounded">
                <span>{p.name}</span>
                <span className="font-medium">{p.sales}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Notes</h2>
        <p className="text-sm text-gray-500">Data is fetched in parallel and cached server-side for 30 seconds. Failed metrics degrade gracefully.</p>
      </section>
    </main>
  );
}
