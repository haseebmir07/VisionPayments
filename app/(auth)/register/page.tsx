// ============================================================
// Vision Glass & Interior — Register Page
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'Registration failed');
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[#22d3ee]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 bg-white rounded-xl p-2 shadow-lg shadow-[#d4aa2e]/20">
            <Image src="/logo.png" alt="Vision Glass Logo" width={80} height={80} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">Create your account</h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Get started with Vision Glass & Interiors today
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#4b5563] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6366f1] hover:text-[#818cf8] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
