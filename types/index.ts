// ============================================================
// Vision Glass & Interior — Shared TypeScript Interfaces & Types
// ============================================================

import { Types } from 'mongoose';

// ─── Utility Types ───────────────────────────────────────────

export type ObjectId = Types.ObjectId;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Enums ───────────────────────────────────────────────────

export const USER_ROLES = ['admin', 'user'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PAYMENT_MODES = ['cash', 'upi'] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

// ─── User ────────────────────────────────────────────────────

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserSafe {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Employee ────────────────────────────────────────────────

export interface IEmployee {
  _id: ObjectId;
  employeeId: string;
  name: string;
  email: string;
  contact: string;
  department?: string;
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployeePopulated extends Omit<IEmployee, 'createdBy'> {
  createdBy: Pick<IUser, '_id' | 'name' | 'email'>;
}

export interface IEmployeeFormData {
  name: string;
  email: string;
  contact: string;
  department?: string;
}

// ─── Expense ─────────────────────────────────────────────────

export interface IExpense {
  _id: ObjectId;
  employee: ObjectId;
  amount: number; // stored in paise (integer)
  description: string;
  paymentMode: PaymentMode;
  date: Date;
  addedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpensePopulated extends Omit<IExpense, 'employee' | 'addedBy'> {
  employee: Pick<IEmployee, '_id' | 'employeeId' | 'name'>;
  addedBy: Pick<IUser, '_id' | 'name'>;
}

export interface IExpenseFormData {
  employee: string;
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  date: string;
}

// ─── Expense Query ───────────────────────────────────────────

export interface ExpenseQueryParams {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  paymentMode?: PaymentMode;
  page?: number;
  limit?: number;
}

export interface ExpenseAggregates {
  daily: number;
  monthly: number;
  grand: number;
}

export interface ExpenseListResponse {
  expenses: IExpensePopulated[];
  aggregates: ExpenseAggregates;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface DashboardStats {
  todayTotal: number;
  yesterdayTotal: number;
  todayDelta: number;
  monthTotal: number;
  lastMonthTotal: number;
  monthDeltaPercent: number;
  activeEmployees: number;
  topCategory: {
    mode: PaymentMode;
    amount: number;
  };
}

export interface DailySpend {
  date: string;
  cash: number;
  upi: number;
  total: number;
}

export interface EmployeeBreakdown {
  employee: Pick<IEmployee, '_id' | 'employeeId' | 'name'>;
  thisMonth: number;
  lastMonth: number;
  delta: number;
  topCategory: PaymentMode;
}

export interface RecentTransaction {
  _id: string;
  employee: Pick<IEmployee, '_id' | 'employeeId' | 'name'>;
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  date: string;
}

// ─── Session Extension ──────────────────────────────────────

import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// ─── Constants ───────────────────────────────────────────────

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Vision Glass & Interior';
export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations',
  'Design',
  'Support',
  'Other',
] as const;

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Employees', href: '/employees', icon: 'Users' },
  { label: 'Expenses', href: '/expenses', icon: 'Receipt' },
  { label: 'Reports', href: '/reports', icon: 'FileBarChart' },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
