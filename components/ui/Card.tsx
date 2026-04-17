// ============================================================
// Vision Glass & Interior — Card, Badge, Skeleton Components
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ─── Card ────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, elevated, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-[rgba(255,255,255,0.06)]',
        elevated ? 'bg-[#111111]' : 'bg-[#0a0a0a]',
        hover && 'cursor-pointer hover:border-[rgba(255,255,255,0.12)] hover:shadow-lg hover:shadow-black/20',
        'transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────

const badgeVariants = {
  cash: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]',
  upi: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  active: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]',
  inactive: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]',
  admin: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]',
  user: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  default: 'bg-[rgba(255,255,255,0.06)] text-[#9ca3af]',
};

interface BadgeProps {
  variant?: keyof typeof badgeVariants;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'skeleton h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return <div className={cn('skeleton h-4 w-full', className)} />;
}

// ─── Empty State ─────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-[rgba(99,102,241,0.15)] text-[#6366f1]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#f9fafb] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#4b5563] mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
