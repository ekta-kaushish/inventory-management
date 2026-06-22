'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { Product, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, Badge } from '@/components/ui';
import { ArrowDownRight, ArrowUpRight, Boxes, AlertCircle } from 'lucide-react';

export default function StockActionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Get a large list to select from
      const response = await api.get<PaginatedResponse<Product>>('/products', {
        params: { limit: 100 },
      });
      setProducts(response.data.items);
    } catch (e) {
      showToast.error('Failed to load products list for dropdown');
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast.error('Please select a product');
      return;
    }
    if (quantity <= 0) {
      showToast.error('Quantity must be greater than zero');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = actionType === 'IN' ? '/stock/in' : '/stock/out';
      const payload = {
        productId: selectedProductId,
        quantity: Number(quantity),
        remarks,
      };

      const response = await api.post(endpoint, payload);
      const updatedProduct = response.data;
      
      showToast.success(
        `Stock ${actionType === 'IN' ? 'added' : 'reduced'} successfully! New Qty: ${updatedProduct.quantity}`
      );

      // Reset form controls
      setQuantity(1);
      setRemarks('');
      // Reload products list to reflect new quantities
      fetchProducts();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to update stock';
      showToast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Stock Adjustments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Perform Stock In and Stock Out operations to log manual shelf changes or shipments
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Transaction Form */}
          <Card className="col-span-1 md:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">New Stock Transaction</CardTitle>
              <CardDescription className="text-slate-400">
                Log inventory movement. Audits will automatically tie to your user session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Selector */}
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Select Product</Label>
                  {loadingProducts ? (
                    <div className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center text-xs text-slate-500 animate-pulse">
                      Loading product catalog...
                    </div>
                  ) : (
                    <Select
                      options={products.map((p) => ({
                        value: p._id,
                        label: `${p.productName} (${p.sku}) - Qty: ${p.quantity}`,
                      }))}
                      placeholder="-- Choose a product from catalog --"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="border-slate-700 bg-slate-950 text-white"
                      disabled={submitting}
                    />
                  )}
                </div>

                {/* Operation Picker */}
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Transaction Action</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActionType('IN')}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border font-semibold transition cursor-pointer ${
                        actionType === 'IN'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:text-slate-200'
                      }`}
                      disabled={submitting}
                    >
                      <ArrowUpRight className="h-4.5 w-4.5" />
                      <span>Stock In (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('OUT')}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border font-semibold transition cursor-pointer ${
                        actionType === 'OUT'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:text-slate-200'
                      }`}
                      disabled={submitting}
                    >
                      <ArrowDownRight className="h-4.5 w-4.5" />
                      <span>Stock Out (-)</span>
                    </button>
                  </div>
                </div>

                {/* Quantity & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 space-y-1.5">
                    <Label className="text-slate-200">Adjustment Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="border-slate-700 bg-slate-950 text-white font-semibold"
                      disabled={submitting}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-slate-200">Remarks / Log Reason</Label>
                    <Input
                      type="text"
                      placeholder="e.g. restock from supplier, customer return, sale..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="border-slate-700 bg-slate-950 text-white"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={submitting || !selectedProductId}
                  className={`w-full font-semibold cursor-pointer ${
                    actionType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Logging transaction...</span>
                    </div>
                  ) : (
                    `Submit Stock ${actionType === 'IN' ? 'In' : 'Out'}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar Context Details */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg h-fit">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Boxes className="h-5 w-5 text-indigo-400" />
                <span>Product Context</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Live statistics of the selected catalog item
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedProduct ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Product Name</p>
                    <p className="text-base font-bold text-white leading-tight">{selectedProduct.productName}</p>
                    <p className="text-xs text-slate-500 font-mono">{selectedProduct.sku}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/80 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">On Hand</p>
                      <p className="text-lg font-bold text-white mt-1">{selectedProduct.quantity}</p>
                    </div>
                    <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/80 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Min Alert</p>
                      <p className="text-lg font-bold text-white mt-1">{selectedProduct.minimumStockLevel}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Category:</span>
                      <span className="font-semibold">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Company:</span>
                      <span className="font-semibold">{selectedProduct.company}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Stock Status:</span>
                      <Badge
                        variant={
                          selectedProduct.status === 'In Stock'
                            ? 'success'
                            : selectedProduct.status === 'Low Stock'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {selectedProduct.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Stock Out Safe-Check warnings */}
                  {actionType === 'OUT' && (
                    <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3 mt-4">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-300">
                          <p className="font-semibold">Stock Reduction Warning</p>
                          <p className="mt-1">
                            Current balance is {selectedProduct.quantity}. Subtracting {quantity} will yield{' '}
                            <strong>{selectedProduct.quantity - quantity}</strong>.
                          </p>
                          {selectedProduct.quantity - quantity < 0 && (
                            <p className="mt-1.5 font-bold text-red-400 uppercase tracking-wide bg-red-950/40 p-1.5 rounded text-center">
                              Insufficient Quantity! Operation Blocked.
                            </p>
                          )}
                          {selectedProduct.quantity - quantity >= 0 &&
                            selectedProduct.quantity - quantity <= selectedProduct.minimumStockLevel && (
                              <p className="mt-1 text-amber-400 font-semibold">
                                Note: This transaction will trigger a Low Stock warning.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm text-center">
                  <p>No product selected.</p>
                  <p className="text-xs text-slate-600 mt-1">Select a catalog item from the left dropdown to check details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
