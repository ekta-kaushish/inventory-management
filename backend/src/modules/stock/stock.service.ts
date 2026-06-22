import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { HistoryService } from '../history/history.service';
import { StockActionDto } from './dto/stock-action.dto';

@Injectable()
export class StockService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
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

  async stockIn(stockActionDto: StockActionDto, userId: string) {
    const { productId, quantity, remarks } = stockActionDto;
    const product = await this.productsService.findOne(productId);

    const previousStock = product.quantity;
    const newStock = previousStock + quantity;

    // Update product quantity and status
    product.quantity = newStock;
    product.status = this.getStatus(newStock, product.minimumStockLevel);
    await product.save();

    // Log to StockHistory
    await this.historyService.create(
      productId,
      'IN',
      quantity,
      previousStock,
      newStock,
      remarks || 'Stock In',
      userId,
    );

    return product;
  }

  async stockOut(stockActionDto: StockActionDto, userId: string) {
    const { productId, quantity, remarks } = stockActionDto;
    const product = await this.productsService.findOne(productId);

    const previousStock = product.quantity;
    if (previousStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${previousStock}, Requested Stock Out: ${quantity}`,
      );
    }

    const newStock = previousStock - quantity;

    // Update product quantity and status
    product.quantity = newStock;
    product.status = this.getStatus(newStock, product.minimumStockLevel);
    await product.save();

    // Log to StockHistory
    await this.historyService.create(
      productId,
      'OUT',
      quantity,
      previousStock,
      newStock,
      remarks || 'Stock Out',
      userId,
    );

    return product;
  }
}
