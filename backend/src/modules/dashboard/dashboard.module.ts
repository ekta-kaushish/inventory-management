import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProductsModule } from '../products/products.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [ProductsModule, HistoryModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
