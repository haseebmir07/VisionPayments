// ============================================================
// Vision Glass & Interior — Utility Functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';
const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Convert paise (integer) to display rupees string
 * e.g., 150000 → "₹1,500.00"
 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return `${CURRENCY_SYMBOL}${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert rupees (display) to paise (storage)
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise (storage) to rupees (display)
 */
export function toRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format date for display in IST
 */
export function formatDate(date: Date | string, pattern: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(d, IST_TIMEZONE);
  return format(zonedDate, pattern);
}

/**
 * Format date-time for display in IST
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

/**
 * Relative time display ("2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get start of day in UTC
 */
export function startOfDayUTC(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day in UTC
 */
export function endOfDayUTC(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month in UTC
 */
export function startOfMonthUTC(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of month in UTC
 */
export function endOfMonthUTC(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Calculate percentage change between two values
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay function for optimistic UI
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build an API response
 */
export function apiSuccess<T>(message: string, data: T, pagination?: unknown) {
  return {
    success: true as const,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
}

export function apiError(message: string, errors?: unknown[]) {
  return {
    success: false as const,
    message,
    ...(errors ? { errors } : {}),
  };
}
