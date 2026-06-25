import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  private getStatus(quantity: number, minimumStockLevel: number): 'In Stock' | 'Low Stock' | 'Out Of Stock' {
    if (quantity === 0) {
      return 'Out Of Stock';
    }
    if (quantity <= minimumStockLevel) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const sku = createProductDto.sku.toUpperCase().trim();
    const existing = await this.productModel.findOne({ sku }).exec();
    if (existing) {
      throw new ConflictException(`Product with SKU '${sku}' already exists.`);
    }

    const quantity = createProductDto.quantity ?? 0;
    const status = this.getStatus(quantity, createProductDto.minimumStockLevel);

    const product = new this.productModel({
      ...createProductDto,
      sku,
      quantity,
      status,
    });
    return product.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    if (updateProductDto.sku) {
      const sku = updateProductDto.sku.toUpperCase().trim();
      if (sku !== product.sku) {
        const existing = await this.productModel.findOne({ sku }).exec();
        if (existing) {
          throw new ConflictException(`Product with SKU '${sku}' already exists.`);
        }
        product.sku = sku;
      }
    }

    // Update other fields
    if (updateProductDto.productName !== undefined) product.productName = updateProductDto.productName;
    if (updateProductDto.company !== undefined) product.company = updateProductDto.company;
    if (updateProductDto.category !== undefined) product.category = updateProductDto.category;
    if (updateProductDto.purchasePrice !== undefined) product.purchasePrice = updateProductDto.purchasePrice;
    if (updateProductDto.description !== undefined) product.description = updateProductDto.description;

    if (updateProductDto.quantity !== undefined) {
      product.quantity = updateProductDto.quantity;
    }
    if (updateProductDto.minimumStockLevel !== undefined) {
      product.minimumStockLevel = updateProductDto.minimumStockLevel;
    }

    // Recompute status
    product.status = this.getStatus(product.quantity, product.minimumStockLevel);

    return product.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async findAll(filterDto: GetProductsFilterDto) {
    const { search, category, status, page = 1, limit = 10 } = filterDto;
    const query: any = {};

    if (search) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { productName: regex },
        { sku: regex },
        { company: regex },
      ];
    }

    if (category) {
      query.category = category.trim();
    }

    if (status) {
      query.status = status.trim();
    }

    const skip = (page - 1) * limit;
    const [totalItems, items] = await Promise.all([
      this.productModel.countDocuments(query).exec(),
      this.productModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

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

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }
}
