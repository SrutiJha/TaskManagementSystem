'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, CheckSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  const rules = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase', valid: /[a-z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.name, data.password);
      toast.success('Account created! Welcome to TaskFlow.');
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      toast.error(axiosErr.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckSquare size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold">TaskFlow</span>
        </div>

        <h1 className="font-display text-3xl font-semibold mb-1">Create account</h1>
        <p className="text-muted-foreground text-sm mb-8">Get started with TaskFlow today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Jane Smith"
              className="input-field"
              autoComplete="name"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="input-field pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {rules.map(({ label, valid }) => (
                  <span
                    key={label}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      valid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2 py-2.5">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                </svg>
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
