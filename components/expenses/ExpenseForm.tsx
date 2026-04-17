// ============================================================
// Vision Glass & Interior — Expense Form Component
// ============================================================

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseSchema, type CreateExpenseInput } from '@/lib/validations';
import { useEmployees } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toPaise } from '@/lib/utils';

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseInput) => void;
  loading?: boolean;
  defaultValues?: Partial<CreateExpenseInput>;
  submitLabel?: string;
}

export function ExpenseForm({
  onSubmit,
  loading,
  defaultValues,
  submitLabel = 'Add Expense',
}: ExpenseFormProps) {
  const { data: employeesData } = useEmployees({ limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      paymentMode: 'cash',
      ...defaultValues,
    },
  });

  const handleFormSubmit = (data: CreateExpenseInput) => {
    onSubmit({
      ...data,
      amount: toPaise(data.amount), // Convert to paise before sending
    });
  };

  const employeeOptions =
    employeesData?.data?.map((emp: { _id: { toString(): string }; name: string; employeeId: string }) => ({
      value: emp._id.toString(),
      label: `${emp.name} (${emp.employeeId})`,
    })) || [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Employee"
        placeholder="Select employee"
        options={employeeOptions}
        error={errors.employee?.message}
        {...register('employee')}
      />

      <Input
        label="Amount (₹)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        prefix="₹"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <Input
        label="Description"
        placeholder="Money for office supplies, travel..."
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Date"
        type="datetime-local"
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Payment Mode */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#9ca3af]">Payment Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="cash"
              className="peer sr-only"
              {...register('paymentMode')}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#111111] text-[#9ca3af] text-sm font-medium transition-all duration-200 peer-checked:border-[#10b981] peer-checked:bg-[rgba(16,185,129,0.1)] peer-checked:text-[#10b981]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
              </svg>
              Cash
            </div>
          </label>
          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="upi"
              className="peer sr-only"
              {...register('paymentMode')}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#111111] text-[#9ca3af] text-sm font-medium transition-all duration-200 peer-checked:border-[#6366f1] peer-checked:bg-[rgba(99,102,241,0.1)] peer-checked:text-[#6366f1]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              UPI
            </div>
          </label>
        </div>
        {errors.paymentMode && (
          <p className="text-xs text-[#ef4444]">{errors.paymentMode.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
