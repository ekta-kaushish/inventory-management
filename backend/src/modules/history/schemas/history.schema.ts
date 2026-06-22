import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockHistoryDocument = StockHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class StockHistory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, enum: ['IN', 'OUT'] })
  transactionType!: 'IN' | 'OUT';

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true })
  previousStock!: number;

  @Prop({ required: true })
  newStock!: number;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
