// ============================================================
// Vision Glass & Interior — Zod Validation Schemas
// ============================================================

import { z } from 'zod';
import { PAYMENT_MODES, DEPARTMENTS } from '@/types';

// ─── Auth Schemas ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Employee Schemas ────────────────────────────────────────

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(7, 'Contact must be at least 7 characters'),
  department: z
    .enum(DEPARTMENTS as unknown as [string, ...string[]])
    .or(z.literal(''))
    .optional()
    .nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── Expense Schemas ─────────────────────────────────────────

export const createExpenseSchema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100000000, 'Amount is too large'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be at most 500 characters'),
  paymentMode: z.enum(PAYMENT_MODES),
  date: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ─── Query Schemas ───────────────────────────────────────────

export const expenseQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const reportQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
});

// ─── Type Exports ────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
