'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { Product, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, Badge } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Package,
  Layers,
  ArrowRightLeft,
  X,
} from 'lucide-react';

// Zod Schema for validation
const productFormSchema = z.object({
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }),
  company: z.string().min(1, { message: 'Company is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  purchasePrice: z.number().min(0, { message: 'Cannot be negative' }),
  discountPercentage: z.number().min(0, { message: 'Cannot be negative' }).max(100, { message: 'Cannot exceed 100%' }),
  minimumStockLevel: z.number().min(0, { message: 'Cannot be negative' }),
  description: z.string().optional(),
});

type ProductFormFields = z.infer<typeof productFormSchema>;

export default function ProductsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  // Products state
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Filter query states
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8;

  // Debounce search input to prevent query spamming
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Modal control states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormFields>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory, selectedStatus, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Product>>('/products', {
        params: {
          search: search || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          page: currentPage,
          limit,
        },
      });
      setData(response.data);
    } catch (e: any) {
      showToast.error('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<string[]>('/products/categories');
      setCategories(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      productName: '',
      sku: '',
      company: '',
      category: '',
      purchasePrice: 0,
      discountPercentage: 0,
      minimumStockLevel: 5,
      description: '',
    });
    setFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setValue('productName', product.productName);
    setValue('sku', product.sku);
    setValue('company', product.company);
    setValue('category', product.category);
    setValue('purchasePrice', product.purchasePrice);
    setValue('discountPercentage', product.discountPercentage ?? 0);
    setValue('minimumStockLevel', product.minimumStockLevel);
    setValue('description', product.description || '');
    setFormModalOpen(true);
  };

  const openDetailsModal = (product: Product) => {
    setViewingProduct(product);
    setDetailsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeletingProductId(id);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (fields: ProductFormFields) => {
    try {
      if (editingProduct) {
        // Edit Mode
        await api.patch(`/products/${editingProduct._id}`, fields);
        showToast.success('Product updated successfully');
        setFormModalOpen(false);
        reset();
      } else {
        // Create Mode
        await api.post('/products', fields);
        showToast.success('Product created successfully');
        reset({
          productName: '',
          sku: '',
          company: '',
          category: '',
          purchasePrice: 0,
          discountPercentage: 0,
          minimumStockLevel: 5,
          description: '',
        });
      }
      fetchProducts();
      fetchCategories();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to save product';
      showToast.error(msg);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      await api.delete(`/products/${deletingProductId}`);
      showToast.success('Product removed successfully');
      setDeleteConfirmOpen(false);
      setDeletingProductId(null);
      fetchProducts();
      fetchCategories();
    } catch (e: any) {
      showToast.error(e.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Product Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add cataloged items, update details, search by SKU, and view stock status summaries
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-500 gap-2 cursor-pointer">
              <Plus className="h-4.5 w-4.5" />
              <span>Add Product</span>
            </Button>
          )}
        </div>

        {/* Filters Controls Panel */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <Input
                type="text"
                placeholder="Search products by SKU, name, or company..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="pl-10 border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-1/2 md:w-44">
                <Select
                  options={categories.map((c) => ({ value: c, label: c }))}
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-slate-700 bg-slate-950 text-slate-300"
                />
              </div>

              <div className="w-1/2 md:w-44">
                <Select
                  options={[
                    { value: 'In Stock', label: 'In Stock' },
                    { value: 'Low Stock', label: 'Low Stock' },
                    { value: 'Out Of Stock', label: 'Out Of Stock' },
                  ]}
                  placeholder="All Statuses"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-slate-700 bg-slate-950 text-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catalog Table Card */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-sm">Fetching catalog list...</p>
                </div>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                <Package className="h-10 w-10 text-slate-600" />
                <p>No products found matching the query</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 text-right">Qty</th>
                    <th className="py-4 px-4 text-right">Cost Price</th>
                    <th className="py-4 px-4 text-right">Discount</th>
                    <th className="py-4 px-4 text-right">Stock Value</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {data.items.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-6 font-medium text-white">
                        <div>
                          <p>{prod.productName}</p>
                          <p className="text-xs text-slate-500">{prod.company}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{prod.sku}</td>
                      <td className="py-3.5 px-4">{prod.category}</td>
                      <td className="py-3.5 px-4 text-right font-semibold">{prod.quantity}</td>
                      <td className="py-3.5 px-4 text-right">₹{prod.purchasePrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400">{prod.discountPercentage || 0}%</td>
                      <td className="py-3.5 px-4 text-right">₹{(prod.quantity * prod.purchasePrice * (1 - (prod.discountPercentage || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            prod.status === 'In Stock'
                              ? 'success'
                              : prod.status === 'Low Stock'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {prod.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailsModal(prod)}
                            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            title="View Info"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 rounded bg-slate-800/60 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(prod._id)}
                                className="p-1.5 rounded bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/50 transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
              <span className="text-xs text-slate-400">
                Showing page <strong className="text-white">{data.meta.currentPage}</strong> of <strong className="text-white">{data.meta.totalPages}</strong> ({data.meta.totalItems} items)
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

      {/* MODAL 1: ADD / EDIT PRODUCT FORM */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="border-slate-800 bg-slate-900 w-full max-w-lg shadow-2xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <CardTitle className="text-white">{editingProduct ? 'Edit Catalog Product' : 'Add New Product'}</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Fill in the specifications below to update catalog indices.
                </CardDescription>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-slate-200">Product Name</Label>
                    <Input
                      className="border-slate-700 bg-slate-950 text-white placeholder-slate-500"
                      placeholder="e.g. MacBook Pro 16"
                      {...register('productName')}
                    />
                    {errors.productName && <p className="text-xs text-red-400">{errors.productName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">SKU Code</Label>
                    <Input
                      className="border-slate-700 bg-slate-950 text-white placeholder-slate-500 font-mono"
                      placeholder="e.g. MAC16-M3MAX"
                      {...register('sku')}
                      disabled={!!editingProduct} // SKU cannot be modified after creation typically
                    />
                    {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Manufacturer/Company</Label>
                    <Input
                      className="border-slate-700 bg-slate-950 text-white placeholder-slate-500"
                      placeholder="e.g. Apple"
                      {...register('company')}
                    />
                    {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Category</Label>
                    <Input
                      className="border-slate-700 bg-slate-950 text-white placeholder-slate-500"
                      placeholder="e.g. Electronics"
                      {...register('category')}
                    />
                    {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Min. Alert Level</Label>
                    <Input
                      type="number"
                      className="border-slate-700 bg-slate-950 text-white"
                      {...register('minimumStockLevel', { valueAsNumber: true })}
                    />
                    {errors.minimumStockLevel && <p className="text-xs text-red-400">{errors.minimumStockLevel.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Purchase Price (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="border-slate-700 bg-slate-950 text-white"
                      {...register('purchasePrice', { valueAsNumber: true })}
                    />
                    {errors.purchasePrice && <p className="text-xs text-red-400">{errors.purchasePrice.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="border-slate-700 bg-slate-950 text-white"
                      {...register('discountPercentage', { valueAsNumber: true })}
                    />
                    {errors.discountPercentage && <p className="text-xs text-red-400">{errors.discountPercentage.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-200">Description (Optional)</Label>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    placeholder="Provide short info description..."
                    {...register('description')}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormModalOpen(false)}
                    className="border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 2: PRODUCT DETAILS VIEW */}
      {detailsModalOpen && viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="border-slate-800 bg-slate-900 w-full max-w-md shadow-2xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <CardTitle className="text-white">Product details</CardTitle>
                <CardDescription className="text-slate-400">Detailed overview specifications</CardDescription>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Name</span>
                  <span className="text-white font-medium text-right">{viewingProduct.productName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">SKU</span>
                  <span className="text-white font-mono">{viewingProduct.sku}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Company</span>
                  <span className="text-white font-medium">{viewingProduct.company}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Category</span>
                  <span className="text-white font-medium">{viewingProduct.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Current Quantity</span>
                  <span className="text-white font-bold">{viewingProduct.quantity} units</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Min Stock Alert Level</span>
                  <span className="text-white font-semibold">{viewingProduct.minimumStockLevel} units</span>
                </div>
                 <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Purchase Price</span>
                  <span className="text-white">₹{viewingProduct.purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Discount</span>
                  <span className="text-amber-400 font-semibold">{viewingProduct.discountPercentage || 0}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Stock Value</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{(viewingProduct.quantity * viewingProduct.purchasePrice * (1 - (viewingProduct.discountPercentage || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 text-xs font-semibold">Status</span>
                  <Badge variant={viewingProduct.status === 'In Stock' ? 'success' : viewingProduct.status === 'Low Stock' ? 'warning' : 'danger'}>
                    {viewingProduct.status}
                  </Badge>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 text-xs font-semibold block mb-1">Description</span>
                  <p className="text-sm text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/50">
                    {viewingProduct.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="border-slate-800 bg-slate-900 w-full max-w-sm shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Remove Product?</CardTitle>
              <CardDescription className="text-slate-400">
                Are you sure you want to delete this product? This action will permanently remove it from the catalog indexes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
