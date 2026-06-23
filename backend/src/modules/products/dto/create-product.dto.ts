import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Name of the product' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  productName!: string;

  @ApiProperty({ example: 'IPH15PRO-128', description: 'Stock keeping unit (SKU)' })
  @IsNotEmpty({ message: 'SKU is required' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Apple Inc.', description: 'Company/manufacturer of the product' })
  @IsNotEmpty({ message: 'Company is required' })
  @IsString()
  company!: string;

  @ApiProperty({ example: 'Electronics', description: 'Product category' })
  @IsNotEmpty({ message: 'Category is required' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 10, description: 'Initial stock quantity', default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity?: number;

  @ApiProperty({ example: 999, description: 'Cost price for purchase' })
  @IsNotEmpty({ message: 'Purchase price is required' })
  @IsNumber()
  @Min(0, { message: 'Purchase price cannot be negative' })
  purchasePrice!: number;

  @ApiProperty({ example: 5, description: 'Minimum inventory level before warning' })
  @IsNotEmpty({ message: 'Minimum stock level is required' })
  @IsNumber()
  @Min(0, { message: 'Minimum stock level cannot be negative' })
  minimumStockLevel!: number;

  @ApiProperty({ example: 'Latest smartphone from Apple', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
