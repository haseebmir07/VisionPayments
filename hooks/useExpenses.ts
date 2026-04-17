// ============================================================
// Vision Glass & Interior — Expense Hooks (React Query)
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ExpenseQueryParams, ApiSuccessResponse, ExpenseListResponse, PaginationMeta } from '@/types';

const EXPENSES_KEY = 'expenses';

async function fetchExpenses(params?: ExpenseQueryParams) {
  const searchParams = new URLSearchParams();
  if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.paymentMode) searchParams.set('paymentMode', params.paymentMode);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const res = await fetch(`/api/expenses?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json() as Promise<
    ApiSuccessResponse<ExpenseListResponse> & { pagination: PaginationMeta }
  >;
}

async function createExpense(data: Record<string, unknown>) {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create expense');
  }
  return res.json();
}

async function updateExpense({ id, data }: { id: string; data: Record<string, unknown> }) {
  const res = await fetch(`/api/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update expense');
  }
  return res.json();
}

async function deleteExpense(id: string) {
  const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete expense');
  }
  return res.json();
}

export function useExpenses(params?: ExpenseQueryParams) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
