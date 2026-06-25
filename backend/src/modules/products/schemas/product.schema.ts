import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, index: true })
  productName!: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  sku!: string;

  @Prop({ required: true, trim: true })
  company!: string;

  @Prop({ required: true, trim: true, index: true })
  category!: string;

  @Prop({ required: true, min: 0, default: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  purchasePrice!: number;

  @Prop({ required: false, min: 0, max: 100, default: 0 })
  discountPercentage?: number;

  @Prop({ required: true, min: 0, default: 5 })
  minimumStockLevel!: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    required: true,
    enum: ['In Stock', 'Low Stock', 'Out Of Stock'],
    default: 'Out Of Stock',
  })
  status!: 'In Stock' | 'Low Stock' | 'Out Of Stock';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
