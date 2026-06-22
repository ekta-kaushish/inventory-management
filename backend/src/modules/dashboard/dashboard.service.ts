import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { StockHistory, StockHistoryDocument } from '../history/schemas/history.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockHistory.name) private readonly historyModel: Model<StockHistoryDocument>,
  ) {}

  async getDashboardStats() {
    // 1. KPI Counts
    const totalProducts = await this.productModel.countDocuments().exec();
    const lowStockProducts = await this.productModel.countDocuments({ status: 'Low Stock' }).exec();
    const outOfStockProducts = await this.productModel.countDocuments({ status: 'Out Of Stock' }).exec();

    const stockStats = await this.productModel.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
        },
      },
    ]).exec();

    const totalStockQuantity = stockStats[0]?.totalQuantity || 0;
    const totalInventoryValue = stockStats[0]?.totalValue || 0;

    // 2. Inventory Overview Chart (Status distribution)
    const statusStats = await this.productModel.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
    ]).exec();

    const inventoryOverview = statusStats.map((item) => ({
      name: item._id,
      value: item.value,
    }));

    // 3. Product Categories Chart
    const categoryStats = await this.productModel.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { quantity: -1 } },
    ]).exec();

    const productCategories = categoryStats.map((item) => ({
      name: item._id,
      productsCount: item.value,
      stockQty: item.quantity,
    }));

    // 4. Monthly Stock Movement Chart (Last 6 Months)
    const startOfPeriod = new Date();
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 5);
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);

    const movementStats = await this.historyModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfPeriod },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$transactionType',
          },
          total: { $sum: '$quantity' },
        },
      },
    ]).exec();

    // Reconstruct list of last 6 months for a clean, zero-filled series
    const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStockMovement = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthNum = monthIndex + 1;

      const inMatch = movementStats.find(
        (m) => m._id.year === year && m._id.month === monthNum && m._id.type === 'IN',
      );
      const outMatch = movementStats.find(
        (m) => m._id.year === year && m._id.month === monthNum && m._id.type === 'OUT',
      );

      monthlyStockMovement.push({
        month: `${monthsName[monthIndex]} ${year.toString().slice(-2)}`,
        StockIn: inMatch?.total || 0,
        StockOut: outMatch?.total || 0,
      });
    }

    return {
      kpis: {
        totalProducts,
        totalInventoryValue,
        totalStockQuantity,
        lowStockProducts,
        outOfStockProducts,
      },
      charts: {
        inventoryOverview,
        productCategories,
        monthlyStockMovement,
      },
    };
  }
}
