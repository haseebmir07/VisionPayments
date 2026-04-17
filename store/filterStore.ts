// ============================================================
// Vision Glass & Interior — Filter State Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { PaymentMode } from '@/types';

interface FilterState {
  employeeId: string;
  startDate: string;
  endDate: string;
  paymentMode: PaymentMode | '';
  page: number;
  limit: number;

  setEmployeeId: (id: string) => void;
  setDateRange: (start: string, end: string) => void;
  setPaymentMode: (mode: PaymentMode | '') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialState = {
  employeeId: '',
  startDate: '',
  endDate: '',
  paymentMode: '' as PaymentMode | '',
  page: 1,
  limit: 20,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  setEmployeeId: (id) => set({ employeeId: id, page: 1 }),
  setDateRange: (start, end) => set({ startDate: start, endDate: end, page: 1 }),
  setPaymentMode: (mode) => set({ paymentMode: mode, page: 1 }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  resetFilters: () => set(initialState),
}));
