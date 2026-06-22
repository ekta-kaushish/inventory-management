'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">Initializing session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
