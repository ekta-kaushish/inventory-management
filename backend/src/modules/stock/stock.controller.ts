import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockActionDto } from './dto/stock-action.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stock Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add quantity to a product stock (Stock In)' })
  @ApiResponse({ status: 200, description: 'Stock updated and logged successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async stockIn(@Body() stockActionDto: StockActionDto, @CurrentUser('id') userId: string) {
    return this.stockService.stockIn(stockActionDto, userId);
  }

  @Post('out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reduce quantity of a product stock (Stock Out)' })
  @ApiResponse({ status: 200, description: 'Stock updated and logged successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g. Insufficient stock)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async stockOut(@Body() stockActionDto: StockActionDto, @CurrentUser('id') userId: string) {
    return this.stockService.stockOut(stockActionDto, userId);
  }
}
