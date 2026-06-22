export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
}

export interface Product {
  _id: string;
  productName: string;
  sku: string;
  company: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  minimumStockLevel: number;
  description?: string;
  status: 'In Stock' | 'Low Stock' | 'Out Of Stock';
  createdAt: string;
  updatedAt: string;
}

export interface StockHistory {
  _id: string;
  productId: {
    _id: string;
    productName: string;
    sku: string;
    company: string;
    category: string;
  } | null;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  previousStock: number;
  newStock: number;
  remarks: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface DashboardStats {
  kpis: {
    totalProducts: number;
    totalInventoryValue: number;
    totalStockQuantity: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  charts: {
    inventoryOverview: { name: string; value: number }[];
    productCategories: { name: string; productsCount: number; stockQty: number }[];
    monthlyStockMovement: { month: string; StockIn: number; StockOut: number }[];
  };
}
