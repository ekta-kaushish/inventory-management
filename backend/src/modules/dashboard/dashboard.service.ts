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
    const startOfPeriod = new Date();
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 5);
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      stockStats,
      statusStats,
      categoryStats,
      movementStats,
    ] = await Promise.all([
      this.productModel.countDocuments().exec(),
      this.productModel.countDocuments({ status: 'Low Stock' }).exec(),
      this.productModel.countDocuments({ status: 'Out Of Stock' }).exec(),
      this.productModel.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalValue: {
              $sum: {
                $multiply: [
                  '$quantity',
                  '$purchasePrice',
                  { $subtract: [1, { $divide: [{ $ifNull: ['$discountPercentage', 0] }, 100] }] }
                ]
              }
            },
          },
        },
      ]).exec(),
      this.productModel.aggregate([
        {
          $group: {
            _id: '$status',
            value: { $sum: 1 },
          },
        },
      ]).exec(),
      this.productModel.aggregate([
        {
          $group: {
            _id: '$category',
            value: { $sum: 1 },
            quantity: { $sum: '$quantity' },
          },
        },
        { $sort: { quantity: -1 } },
      ]).exec(),
      this.historyModel.aggregate([
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
      ]).exec(),
    ]);

    const totalStockQuantity = stockStats[0]?.totalQuantity || 0;
    const totalInventoryValue = stockStats[0]?.totalValue || 0;

    const inventoryOverview = statusStats.map((item) => ({
      name: item._id,
      value: item.value,
    }));

    const productCategories = categoryStats.map((item) => ({
      name: item._id,
      productsCount: item.value,
      stockQty: item.quantity,
    }));

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
