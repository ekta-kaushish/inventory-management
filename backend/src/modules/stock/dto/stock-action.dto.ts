import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class StockActionDto {
  @ApiProperty({ example: '60d5ec49e4b6c317d0c3e6b2', description: 'ID of the product' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 10, description: 'Quantity to adjust stock' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @ApiProperty({ example: 'Received new batch shipment', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
