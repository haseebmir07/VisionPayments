// ============================================================
// Vision Glass & Interior — Employees Page
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { formatDate, getInitials } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { CreateEmployeeInput } from '@/lib/validations';

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEmployees({ page, search, limit: 20 });
  const createMutation = useCreateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = async (formData: CreateEmployeeInput) => {
    try {
      await createMutation.mutateAsync(formData);
      setShowAddModal(false);
    } catch (error: any) {
      alert(error.message || 'An error occurred while creating the employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (emp: Record<string, unknown>) => (
        <Link href={`/employees/${emp._id}`} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(String(emp.name || 'U'))}
          </div>
          <div>
            <p className="text-sm font-medium text-[#f9fafb] group-hover:text-[#6366f1] transition-colors">
              {String(emp.name)}
            </p>
            <p className="text-xs text-[#4b5563]">{String(emp.email)}</p>
          </div>
        </Link>
      ),
    },
    {
      key: 'employeeId',
      label: 'ID',
      sortable: true,
      render: (emp: Record<string, unknown>) => (
        <span className="text-sm font-mono text-[#9ca3af]">{String(emp.employeeId)}</span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (emp: Record<string, unknown>) => (
        <span className="text-sm text-[#9ca3af]">{String(emp.department || '—')}</span>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (emp: Record<string, unknown>) => (
        <span className="text-sm text-[#9ca3af]">{String(emp.contact)}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (emp: Record<string, unknown>) => (
        <Badge variant={emp.isActive ? 'active' : 'inactive'}>
          {emp.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (emp: Record<string, unknown>) => (
        <span className="text-sm text-[#4b5563]">{formatDate(String(emp.createdAt))}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (emp: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <Link href={`/employees/${emp._id}`}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
          {session?.user?.role === 'admin' && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(String(emp._id));
              }}
              loading={deleteMutation.isPending}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f9fafb]">Employees</h2>
          <p className="text-sm text-[#4b5563] mt-0.5">
            {pagination?.total || 0} total employees
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          suffix={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={employees}
        loading={isLoading}
        keyExtractor={(emp) => String(emp._id)}
        emptyState={
          <EmptyState
            title="No employees found"
            description="Add your first employee to get started"
            action={<Button onClick={() => setShowAddModal(true)}>Add Employee</Button>}
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
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
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
        title="Add New Employee"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
