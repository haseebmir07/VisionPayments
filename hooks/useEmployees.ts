// ============================================================
// Vision Glass & Interior — Employee Hooks (React Query)
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IEmployee, ApiSuccessResponse, PaginationMeta } from '@/types';

const EMPLOYEES_KEY = 'employees';

async function fetchEmployees(params?: {
  page?: number;
  limit?: number;
  search?: string;
  active?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.active) searchParams.set('active', params.active);

  const res = await fetch(`/api/employees?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json() as Promise<
    ApiSuccessResponse<IEmployee[]> & { pagination: PaginationMeta }
  >;
}

async function fetchEmployee(id: string) {
  const res = await fetch(`/api/employees/${id}`);
  if (!res.ok) throw new Error('Failed to fetch employee');
  return res.json();
}

async function createEmployee(data: Record<string, unknown>) {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create employee');
  }
  return res.json();
}

async function updateEmployee({ id, data }: { id: string; data: Record<string, unknown> }) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update employee');
  }
  return res.json();
}

async function deleteEmployee(id: string) {
  const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete employee');
  }
  return res.json();
}

export function useEmployees(params?: {
  page?: number;
  limit?: number;
  search?: string;
  active?: string;
}) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, params],
    queryFn: () => fetchEmployees(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, id],
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}
