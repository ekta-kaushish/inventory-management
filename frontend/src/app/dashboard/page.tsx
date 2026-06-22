'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';
import { showToast } from '@/store/toastStore';
import {
  Package,
  CircleDollarSign,
  Boxes,
  AlertTriangle,
  FileMinus2,
  TrendingUp,
  PieChart as PieIcon,
  FolderTree,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardStats>('/dashboard');
      setStats(response.data);
    } catch (error: any) {
      showToast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats || !mounted) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 rounded bg-slate-800 animate-pulse"></div>
            <div className="h-4 w-64 rounded bg-slate-800 animate-pulse"></div>
          </div>
          {/* Shimmer Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="h-4 w-24 rounded bg-slate-800 animate-pulse"></div>
                  <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-8 w-16 rounded bg-slate-800 animate-pulse"></div>
                  <div className="h-3 w-32 rounded bg-slate-800 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Shimmer Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-96 border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="h-5 w-32 rounded bg-slate-800 animate-pulse"></div>
                  <div className="h-3 w-48 rounded bg-slate-800 animate-pulse"></div>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="h-full w-full rounded bg-slate-800 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const { kpis, charts } = stats;

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpis.totalProducts,
      desc: 'Cataloged distinct SKUs',
      icon: Package,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    },
    {
      title: 'Inventory Value',
      value: `$${kpis.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: 'Cumulative catalog asset value',
      icon: CircleDollarSign,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    },
    {
      title: 'Stock Quantity',
      value: kpis.totalStockQuantity.toLocaleString(),
      desc: 'Total physical items on shelves',
      icon: Boxes,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
    },
    {
      title: 'Low Stock Alerts',
      value: kpis.lowStockProducts,
      desc: 'Requires re-ordering attention',
      icon: AlertTriangle,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
      badge: kpis.lowStockProducts > 0 ? 'Action Required' : undefined,
    },
    {
      title: 'Out of Stock',
      value: kpis.outOfStockProducts,
      desc: 'Shelf empty (0 units left)',
      icon: FileMinus2,
      color: 'text-red-400 border-red-500/20 bg-red-500/10',
      badge: kpis.outOfStockProducts > 0 ? 'Alert' : undefined,
    },
  ];

  // Pie chart coloring
  const PIE_COLORS = {
    'In Stock': '#10b981', // green
    'Low Stock': '#f59e0b', // amber
    'Out Of Stock': '#ef4444', // red
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Inventory Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time metrics aggregate views, categories distribution, and movement tracking logs
            </p>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </CardTitle>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none truncate">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    {card.desc}
                  </p>
                  {card.badge && (
                    <Badge variant={card.title === 'Out of Stock' ? 'danger' : 'warning'} className="mt-2.5">
                      {card.badge}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Chart 1: Stock Movement */}
          <Card className="col-span-1 md:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <TrendingUp className="h-5 w-5" />
                <CardTitle className="text-base font-semibold text-white">Monthly Stock Movement</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Audit volume transactions of Stock In vs Stock Out operations (last 6 months)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyStockMovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Stock In (Units)" type="monotone" dataKey="StockIn" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                  <Area name="Stock Out (Units)" type="monotone" dataKey="StockOut" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Inventory Distribution */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <PieIcon className="h-5 w-5" />
                <CardTitle className="text-base font-semibold text-white">Inventory Overview</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Breakdown shares of products by stock status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex flex-col justify-center pt-4">
              {charts.inventoryOverview.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  No stock data available
                </div>
              ) : (
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={charts.inventoryOverview}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.inventoryOverview.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#6366f1'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#ffffff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
                    {charts.inventoryOverview.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[item.name as keyof typeof PIE_COLORS] }}
                        ></span>
                        <span className="text-slate-300">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Category Stock Count */}
          <Card className="col-span-1 md:col-span-3 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <FolderTree className="h-5 w-5" />
                <CardTitle className="text-base font-semibold text-white">Stock Volume by Category</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Quantity counts of products stocked across unique categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              {charts.productCategories.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  No cataloged categories
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.productCategories} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar name="Stock Qty" dataKey="stockQty" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {charts.productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#06b6d4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
