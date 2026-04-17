// ============================================================
// Vision Glass & Interior — Input Component
// ============================================================

'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#9ca3af]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-sm font-mono">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[8px] bg-[#111111] border border-[rgba(255,255,255,0.06)] px-3 py-2.5 text-sm text-[#f9fafb]',
              'placeholder:text-[#4b5563]',
              'transition-all duration-200 ease-out',
              'hover:border-[rgba(255,255,255,0.12)]',
              'focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              prefix && 'pl-8',
              suffix && 'pr-10',
              error && 'border-[#ef4444] focus:ring-[#ef4444]',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563]">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#ef4444] mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
