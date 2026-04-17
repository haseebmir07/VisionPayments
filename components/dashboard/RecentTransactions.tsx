// ============================================================
// Vision Glass & Interior — Recent Transactions Component
// ============================================================

'use client';

import { Card, Badge } from '@/components/ui/Card';
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils';
import type { RecentTransaction } from '@/types';

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-[#f9fafb] mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-[#4b5563] text-center py-8">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center gap-3 p-3 rounded-[8px] hover:bg-[#111111] transition-colors duration-200"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {getInitials(tx.employee?.name || 'U')}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#f9fafb] truncate">
                    {tx.employee?.name || 'Unknown'}
                  </p>
                  <Badge variant={tx.paymentMode as 'cash' | 'upi'}>
                    {tx.paymentMode.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[#4b5563] truncate mt-0.5">{tx.description}</p>
              </div>

              {/* Amount & Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-[#f9fafb] font-mono">
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-[#4b5563] mt-0.5">
                  {formatRelativeTime(tx.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
