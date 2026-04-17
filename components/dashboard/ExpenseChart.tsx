// ============================================================
// Vision Glass & Interior — Expense Chart Component
// ============================================================

'use client';

import { Card } from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatDate, toRupees } from '@/lib/utils';
import type { DailySpend } from '@/types';

interface ExpenseChartProps {
  data: DailySpend[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[8px] p-3 shadow-xl">
      <p className="text-xs text-[#4b5563] mb-2">
        {label ? formatDate(label, 'dd MMM yyyy') : ''}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[#9ca3af] capitalize">{entry.dataKey}:</span>
          <span className="font-mono font-semibold text-[#f9fafb]">
            ₹{toRupees(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[#f9fafb]">Expense Trend</h3>
          <p className="text-xs text-[#4b5563] mt-0.5">Last 30 days — Cash vs UPI</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-xs text-[#4b5563]">Cash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-xs text-[#4b5563]">UPI</span>
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="upiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v, 'dd')}
              stroke="#4b5563"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 100).toLocaleString('en-IN', { notation: 'compact' })}`}
              stroke="#4b5563"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#cashGradient)"
            />
            <Area
              type="monotone"
              dataKey="upi"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#upiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
