import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockHistory, StockHistoryDocument } from './schemas/history.schema';
import { GetHistoryFilterDto } from './dto/get-history-filter.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(StockHistory.name) private readonly historyModel: Model<StockHistoryDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    productId: string,
    transactionType: 'IN' | 'OUT',
    quantity: number,
    previousStock: number,
    newStock: number,
    remarks: string,
    userId: string,
  ): Promise<StockHistoryDocument> {
    const entry = new this.historyModel({
      productId: new Types.ObjectId(productId),
      transactionType,
      quantity,
      previousStock,
      newStock,
      remarks: remarks || '',
      userId: new Types.ObjectId(userId),
    });
    return entry.save();
  }

  async findAll(filterDto: GetHistoryFilterDto) {
    const { search, transactionType, productId, startDate, endDate, page = 1, limit = 10 } = filterDto;
    const query: any = {};

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (productId) {
      query.productId = new Types.ObjectId(productId);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      
      // Find matching products
      const products = await this.productModel.find({
        $or: [{ productName: regex }, { sku: regex }, { company: regex }],
      }).select('_id').exec();
      const productIds = products.map((p) => p._id);

      // Find matching users
      const users = await this.userModel.find({
        $or: [{ name: regex }, { email: regex }],
      }).select('_id').exec();
      const userIds = users.map((u) => u._id);

      // Match logs that relate to these products OR these users
      query.$or = [
        { productId: { $in: productIds } },
        { userId: { $in: userIds } },
      ];
    }

    const skip = (page - 1) * limit;
    const totalItems = await this.historyModel.countDocuments(query).exec();
    
    const items = await this.historyModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('productId', 'productName sku company category')
      .populate('userId', 'name email role')
      .exec();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
