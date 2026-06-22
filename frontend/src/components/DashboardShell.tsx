'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';
import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  History,
  FileSpreadsheet,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Verifying session permissions...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    showToast.success('Logged out successfully');
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products list', href: '/products', icon: Package },
    { label: 'Stock actions', href: '/stock', icon: ArrowUpDown },
    { label: 'Transaction history', href: '/history', icon: History },
    { label: 'Reports export', href: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-slate-800 gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">StockKeeper</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </a>
            );
          })}
        </nav>
        
        {/* User Card */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/50 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <Badge variant={user.role === 'Admin' ? 'danger' : 'success'} className="mt-0.5 scale-90 origin-left">
                {user.role}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-900/20 md:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            <span className="font-bold text-white">StockKeeper</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-slate-950/95 flex flex-col p-6 space-y-6 pt-20 animate-fade-in">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <Badge variant={user.role === 'Admin' ? 'danger' : 'success'} className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-red-400 hover:bg-red-950/30 border border-red-900/30 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-slate-950/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
