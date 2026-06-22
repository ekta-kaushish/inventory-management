'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { ShieldCheck, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,
        data
      );

      const { accessToken, refreshToken, user } = response.data;
      setAuth(user, accessToken, refreshToken);
      showToast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* Background radial glowing gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[40%] left-[20%] h-[600px] w-[600px] rounded-full bg-indigo-500 blur-[150px]"></div>
        <div className="absolute -bottom-[30%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <ShieldCheck className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            Inventory Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access stock levels and analytics logs
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl glass">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white">Account Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to manage records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900"
                    {...register('email')}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900"
                    {...register('password')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition duration-150 ease-in-out cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Seed Accounts Info Panel */}
            <div className="mt-6 rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300">Quick Access Seed Accounts:</p>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span><strong className="text-slate-300">Admin Role:</strong> admin@inventory.com</span>
                <span className="text-indigo-400 font-mono">Admin@123456</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span><strong className="text-slate-300">Staff Role:</strong> staff@inventory.com</span>
                <span className="text-indigo-400 font-mono">Staff@123456</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
