import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { StockHistory, StockHistorySchema } from './schemas/history.schema';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockHistory.name, schema: StockHistorySchema }]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService, MongooseModule],
})
export class HistoryModule {}
