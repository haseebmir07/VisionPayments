// ============================================================
// Vision Glass & Interior — Select Component
// ============================================================

'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#9ca3af]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-[8px] bg-[#111111] border border-[rgba(255,255,255,0.06)] px-3 py-2.5 text-sm text-[#f9fafb]',
            'transition-all duration-200 ease-out',
            'hover:border-[rgba(255,255,255,0.12)]',
            'focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none bg-no-repeat bg-right',
            error && 'border-[#ef4444] focus:ring-[#ef4444]',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundPosition: 'right 12px center',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-[#ef4444] mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
