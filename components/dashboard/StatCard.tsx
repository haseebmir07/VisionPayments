// ============================================================
// Vision Glass & Interior — StatCard Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  accent?: string;
}

export function StatCard({ title, value, delta, deltaLabel, icon, accent = '#6366f1' }: StatCardProps) {
  const isPositive = (delta ?? 0) > 0;
  const isNegative = (delta ?? 0) < 0;

  return (
    <Card className="p-5 relative overflow-hidden group">
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#4b5563] uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-[#f9fafb] font-mono tracking-tight">{value}</p>
          {delta !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold',
                  isPositive && 'text-[#ef4444]',
                  isNegative && 'text-[#10b981]',
                  !isPositive && !isNegative && 'text-[#4b5563]'
                )}
              >
                {isPositive ? '↑' : isNegative ? '↓' : '→'}
                {Math.abs(delta)}%
              </span>
              {deltaLabel && (
                <span className="text-xs text-[#4b5563]">{deltaLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className="p-2.5 rounded-[8px] transition-colors duration-200"
          style={{ background: `${accent}20`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
