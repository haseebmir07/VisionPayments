// ============================================================
// Vision Glass & Interior — Table Component
// ============================================================

'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Card';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (item: any, index: number) => ReactNode;
}

interface TableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  loading?: boolean;
  emptyState?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (item: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyExtractor: (item: any) => string;
}

export function Table({
  columns,
  data,
  loading,
  emptyState,
  onRowClick,
  keyExtractor,
}: TableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDir === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      })
    : data;

  if (loading) {
    return (
      <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#4b5563] uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,0.03)]">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] p-8">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-[#4b5563] uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-[#9ca3af] transition-colors duration-200',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <svg
                        className={cn('w-3 h-3 transition-transform', sortDir === 'desc' && 'rotate-180')}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'border-b border-[rgba(255,255,255,0.03)] transition-colors duration-200',
                  onRowClick && 'cursor-pointer hover:bg-[#111111]'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                    {col.render
                      ? col.render(item, index)
                      : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
