// ============================================================
// Vision Glass & Interior — Employee Detail Page
// ============================================================

'use client';

import { use } from 'react';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import type { CreateEmployeeInput } from '@/lib/validations';

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: empData, isLoading: empLoading } = useEmployee(id);
  const { data: expData, isLoading: expLoading } = useExpenses({ employeeId: id, limit: 50 });
  const updateMutation = useUpdateEmployee();
  const [showEditModal, setShowEditModal] = useState(false);

  const employee = empData?.data;
  const expenses = expData?.data?.expenses || [];
  const summary = employee?.summary;

  const handleUpdate = async (data: CreateEmployeeInput) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setShowEditModal(false);
    } catch {
      // Error in mutation
    }
  };

  if (empLoading) {
    return (
      <div className="space-y-6">
        <div className="card p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-[#f9fafb]">Employee not found</h2>
        <Link href="/employees">
          <Button variant="ghost" className="mt-4">Back to Employees</Button>
        </Link>
      </div>
    );
  }

  const expenseColumns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (exp: Record<string, unknown>) => (
        <span className="text-sm text-[#9ca3af]">{formatDate(String(exp.date))}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (exp: Record<string, unknown>) => (
        <span className="text-sm text-[#f9fafb]">{String(exp.description)}</span>
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
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-sm text-[#4b5563] hover:text-[#f9fafb] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Employees
      </Link>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {getInitials(employee.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-[#f9fafb]">{employee.name}</h2>
              <Badge variant={employee.isActive ? 'active' : 'inactive'}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm font-mono text-[#4b5563]">{employee.employeeId}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#9ca3af]">
              <span>{employee.email}</span>
              <span>{employee.contact}</span>
              {employee.department && <span>{employee.department}</span>}
            </div>
          </div>
          <Button variant="ghost" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
          <div>
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Total Spent</p>
            <p className="text-lg font-bold font-mono text-[#f9fafb] mt-1">
              {formatCurrency(summary?.totalSpent || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Expenses</p>
            <p className="text-lg font-bold font-mono text-[#f9fafb] mt-1">
              {summary?.totalExpenses || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Avg Expense</p>
            <p className="text-lg font-bold font-mono text-[#f9fafb] mt-1">
              {formatCurrency(summary?.avgExpense || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#4b5563] uppercase tracking-wider">Last Expense</p>
            <p className="text-lg font-bold text-[#f9fafb] mt-1">
              {summary?.lastExpenseDate
                ? formatDate(summary.lastExpenseDate)
                : 'Never'}
            </p>
          </div>
        </div>
      </Card>

      {/* Expenses */}
      <div>
        <h3 className="text-lg font-semibold text-[#f9fafb] mb-4">Expense History</h3>
        <Table
          columns={expenseColumns}
          data={expenses}
          loading={expLoading}
          keyExtractor={(exp) => String(exp._id)}
          emptyState={
            <div className="text-center py-8 text-sm text-[#4b5563]">
              No expenses recorded
            </div>
          }
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
      >
        <EmployeeForm
          onSubmit={handleUpdate}
          loading={updateMutation.isPending}
          submitLabel="Update Employee"
          defaultValues={{
            name: employee.name,
            email: employee.email,
            contact: employee.contact,
            department: employee.department,
          }}
        />
      </Modal>
    </div>
  );
}
