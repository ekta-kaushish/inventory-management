'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { StockHistory, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, Badge } from '@/components/ui';
import {
  Search,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FilterX,
} from 'lucide-react';

export default function HistoryPage() {
  const [data, setData] = useState<PaginatedResponse<StockHistory> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
  }, [search, type, startDate, endDate, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<StockHistory>>('/history', {
        params: {
          search: search || undefined,
          transactionType: type || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
          limit,
        },
      });
      setData(response.data);
    } catch (e) {
      showToast.error('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Transaction History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Complete audit trail of all manual adjustments, restocks, and sales allocations
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4 md:p-6 grid gap-4 md:grid-cols-4 items-end">
            {/* Search Keyword */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <Label className="text-slate-300">Keyword Search</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Search by SKU, product name, or employee..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border-slate-700 bg-slate-950 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-slate-300">Transaction Type</Label>
              <Select
                options={[
                  { value: 'IN', label: 'Stock In (+)' },
                  { value: 'OUT', label: 'Stock Out (-)' },
                ]}
                placeholder="All Transactions"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-slate-700 bg-slate-950 text-slate-300"
              />
            </div>

            {/* Clear Button */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-slate-800 text-slate-400 hover:text-white justify-center gap-2 cursor-pointer w-full"
            >
              <FilterX className="h-4.5 w-4.5" />
              <span>Reset Filters</span>
            </Button>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-slate-300">Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-slate-700 bg-slate-950 text-white pr-3"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label className="text-slate-300">End Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-slate-700 bg-slate-950 text-white pr-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Table Card */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-sm">Fetching audit logs...</p>
                </div>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                <History className="h-10 w-10 text-slate-600" />
                <p>No transactions registered for this search query</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-4">Product Details</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4 text-center">Action</th>
                    <th className="py-4 px-4 text-right">Quantity</th>
                    <th className="py-4 px-4 text-center">Difference</th>
                    <th className="py-4 px-4">Remarks</th>
                    <th className="py-4 px-6">Author</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {data.items.map((log) => {
                    const isStockIn = log.transactionType === 'IN';
                    return (
                      <tr key={log._id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3.5 px-6 font-medium text-slate-400">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {log.productId?.productName || <span className="text-red-500 font-normal italic">Deleted SKU</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{log.productId?.sku || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant={isStockIn ? 'success' : 'danger'}
                            className="gap-1 flex items-center justify-center w-24 mx-auto"
                          >
                            {isStockIn ? (
                              <>
                                <ArrowUpRight className="h-3 w-3" />
                                <span>Stock In</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3" />
                                <span>Stock Out</span>
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold ${isStockIn ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isStockIn ? '+' : '-'}{log.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="py-3.5 px-4 truncate max-w-[180px]" title={log.remarks}>
                          {log.remarks || <span className="text-slate-600 italic">No notes</span>}
                        </td>
                        <td className="py-3.5 px-6">
                          <div>
                            <p className="font-medium text-white">{log.userId?.name || 'Deleted User'}</p>
                            <p className="text-xs text-slate-500">{log.userId?.role || 'N/A'}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
              <span className="text-xs text-slate-400">
                Showing page <strong className="text-white">{data.meta.currentPage}</strong> of <strong className="text-white">{data.meta.totalPages}</strong> ({data.meta.totalItems} logs)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={data.meta.currentPage === 1}
                  className="border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={data.meta.currentPage === data.meta.totalPages}
                  className="border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
