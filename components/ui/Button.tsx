// ============================================================
// Vision Glass & Interior — Button Component
// ============================================================

'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-[#6366f1] text-white hover:bg-[#818cf8] active:bg-[#4f46e5] shadow-lg shadow-indigo-500/20',
  ghost:
    'bg-transparent border border-[rgba(255,255,255,0.06)] text-[#f9fafb] hover:bg-[#1a1a1a] hover:border-[rgba(255,255,255,0.12)]',
  danger:
    'bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-lg shadow-red-500/20',
  outline:
    'bg-transparent border border-[#6366f1] text-[#6366f1] hover:bg-[rgba(99,102,241,0.15)]',
  secondary:
    'bg-[#111111] text-[#f9fafb] border border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[6px] transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
