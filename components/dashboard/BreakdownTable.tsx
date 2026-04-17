// ============================================================
// Vision Glass & Interior — Employee Breakdown Table Component
// ============================================================

'use client';

import { Card, Badge } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { EmployeeBreakdown } from '@/types';

interface BreakdownTableProps {
  data: EmployeeBreakdown[];
}

export function BreakdownTable({ data }: BreakdownTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className="text-sm font-semibold text-[#f9fafb]">Employee Breakdown</h3>
        <p className="text-xs text-[#4b5563] mt-0.5">This month vs last month</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#4b5563] uppercase tracking-wider">Employee</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#4b5563] uppercase tracking-wider">This Month</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#4b5563] uppercase tracking-wider">Last Month</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#4b5563] uppercase tracking-wider">Delta</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#4b5563] uppercase tracking-wider">Top Mode</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#4b5563]">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const delta = item.thisMonth - item.lastMonth;
                const isUp = delta > 0;
                const isDown = delta < 0;

                return (
                  <tr
                    key={item.employee._id?.toString()}
                    className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#111111] transition-colors duration-200"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#f9fafb]">{item.employee.name}</p>
                        <p className="text-xs text-[#4b5563]">{item.employee.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-mono font-semibold text-[#f9fafb]">
                        {formatCurrency(item.thisMonth)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-mono text-[#9ca3af]">
                        {formatCurrency(item.lastMonth)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`text-sm font-mono font-semibold ${
                          isUp ? 'text-[#ef4444]' : isDown ? 'text-[#10b981]' : 'text-[#4b5563]'
                        }`}
                      >
                        {isUp ? '+' : ''}{formatCurrency(delta)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={(item.topCategory || 'default') as 'cash' | 'upi'}>
                        {(item.topCategory || 'N/A').toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
