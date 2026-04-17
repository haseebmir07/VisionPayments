// ============================================================
// Vision Glass & Interior — Dashboard Page
// ============================================================

'use client';

import { useStats } from '@/hooks/useStats';
import { formatCurrency, percentChange } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BreakdownTable } from '@/components/dashboard/BreakdownTable';
import { Skeleton } from '@/components/ui/Card';

export default function DashboardPage() {
  const { data, isLoading } = useStats();

  const stats = data?.data?.stats;
  const chartData = data?.data?.chartData || [];
  const breakdown = data?.data?.employeeBreakdown || [];
  const recent = data?.data?.recentTransactions || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="card p-5">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-5">
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="card p-5">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Spend"
          value={formatCurrency(stats?.todayTotal || 0)}
          delta={stats ? percentChange(stats.todayTotal, stats.yesterdayTotal) : 0}
          deltaLabel="vs yesterday"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          accent="#22d3ee"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.monthTotal || 0)}
          delta={stats?.monthDeltaPercent || 0}
          deltaLabel="vs last month"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          accent="#6366f1"
        />
        <StatCard
          title="Active Employees"
          value={String(stats?.activeEmployees || 0)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          accent="#10b981"
        />
        <StatCard
          title="Top Mode (Monthly)"
          value={stats?.topCategory?.mode?.toUpperCase() || 'N/A'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
          accent="#f59e0b"
        />
      </div>

      {/* Expense Chart */}
      <ExpenseChart data={chartData} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <BreakdownTable data={breakdown} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions transactions={recent} />
        </div>
      </div>
    </div>
  );
}
