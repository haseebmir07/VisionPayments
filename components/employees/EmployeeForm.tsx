// ============================================================
// Vision Glass & Interior — Employee Form Component
// ============================================================

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, type CreateEmployeeInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DEPARTMENTS } from '@/types';

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeInput) => void;
  loading?: boolean;
  defaultValues?: Partial<CreateEmployeeInput>;
  submitLabel?: string;
}

export function EmployeeForm({
  onSubmit,
  loading,
  defaultValues,
  submitLabel = 'Add Employee',
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues,
  });

  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="john@company.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Contact"
        placeholder="+91 98765 43210"
        error={errors.contact?.message}
        {...register('contact')}
      />
      <Select
        label="Department"
        placeholder="Select department"
        options={departmentOptions}
        error={errors.department?.message}
        {...register('department')}
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
