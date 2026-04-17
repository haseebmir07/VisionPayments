// ============================================================
// Vision Glass & Interior — Dashboard Stats Hook (React Query)
// ============================================================

'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchDashboardStats() {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
