// ============================================================
// Vision Glass & Interior — Expenses Page
// ============================================================

'use client';

import { useState } from 'react';
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useEmployees } from '@/hooks/useEmployees';
import { useFilterStore } from '@/store/filterStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { CreateExpenseInput } from '@/lib/validations';

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [showAddModal, setShowAddModal] = useState(false);
  const filters = useFilterStore();

  const queryParams = {
    ...(filters.employeeId && { employeeId: filters.employeeId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.paymentMode && { paymentMode: filters.paymentMode }),
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading } = useExpenses(queryParams);
  const { data: employeesData } = useEmployees({ limit: 100 });
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const expenses = data?.data?.expenses || [];
  const aggregates = data?.data?.aggregates;
  const pagination = data?.pagination;

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...(employeesData?.data?.map((emp: { _id: { toString(): string }; name: string }) => ({
      value: emp._id.toString(),
      label: emp.name,
    })) || []),
  ];

  const handleCreate = async (formData: CreateExpenseInput) => {
    try {
      await createMutation.mutateAsync(formData);
      setShowAddModal(false);
    } catch {
      // Error in mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (exp: Record<string, unknown>) => {
        const emp = exp.employee as Record<string, unknown> | undefined;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-xs font-bold text-white">
              {getInitials(String(emp?.name || 'U'))}
            </div>
            <div>
              <p className="text-sm font-medium text-[#f9fafb]">{String(emp?.name || 'Unknown')}</p>
              <p className="text-xs text-[#4b5563] font-mono">{String(emp?.employeeId || '')}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (exp: Record<string, unknown>) => (
        <p className="text-sm text-[#f9fafb] max-w-xs truncate">{String(exp.description)}</p>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      className: 'text-right',
      render: (exp: Record<string, unknown>) => (
        <span className="text-sm font-mono font-semibold text-[#f9fafb]">
          {formatCurrency(Number(exp.amount))}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      label: 'Payment',
      render: (exp: Record<string, unknown>) => (
        <Badge variant={String(exp.paymentMode) as 'cash' | 'upi'}>
          {String(exp.paymentMode).toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (exp: Record<string, unknown>) => (
        <div>
          <p className="text-sm text-[#9ca3af]">{formatDate(String(exp.date))}</p>
          <p className="text-xs text-[#4b5563]">{formatRelativeTime(String(exp.date))}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (exp: Record<string, unknown>) =>
        session?.user?.role === 'admin' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(String(exp._id))}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f9fafb]">Expenses</h2>
          <p className="text-sm text-[#4b5563] mt-0.5">
            {pagination?.total || 0} total expenses
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Expense
        </Button>
      </div>

      {/* Aggregate Cards */}
      {aggregates && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Today</p>
            <p className="text-xl font-bold font-mono text-[#22d3ee] mt-1">
              {formatCurrency(aggregates.daily)}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">This Month</p>
            <p className="text-xl font-bold font-mono text-[#6366f1] mt-1">
              {formatCurrency(aggregates.monthly)}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Grand Total</p>
            <p className="text-xl font-bold font-mono text-[#f9fafb] mt-1">
              {formatCurrency(aggregates.grand)}
            </p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Employee"
            options={employeeOptions}
            value={filters.employeeId}
            onChange={(e) => filters.setEmployeeId(e.target.value)}
          />
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => filters.setDateRange(e.target.value, filters.endDate)}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => filters.setDateRange(filters.startDate, e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#9ca3af]">Payment Mode</label>
            <div className="flex gap-2">
              {['', 'cash', 'upi'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => filters.setPaymentMode(mode as '' | 'cash' | 'upi')}
                  className={`px-3 py-2 rounded-[6px] text-xs font-semibold transition-all duration-200 ${
                    filters.paymentMode === mode
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#111111] text-[#9ca3af] hover:text-[#f9fafb] border border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  {mode === '' ? 'All' : mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(filters.employeeId || filters.startDate || filters.endDate || filters.paymentMode) && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={filters.resetFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={expenses}
        loading={isLoading}
        keyExtractor={(exp) => String(exp._id)}
        emptyState={
          <EmptyState
            title="No expenses found"
            description="Add your first expense or adjust your filters"
            action={<Button onClick={() => setShowAddModal(true)}>Add Expense</Button>}
          />
        }
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#4b5563]">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => filters.setPage(filters.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => filters.setPage(filters.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleCreate}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
