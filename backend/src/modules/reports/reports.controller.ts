import { Controller, Get, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products')
  @ApiOperation({ summary: 'Export product inventory report as Excel or PDF' })
  @ApiQuery({ name: 'format', enum: ['excel', 'pdf'], required: true, description: 'File format of report' })
  @ApiResponse({ status: 200, description: 'File stream response' })
  @ApiResponse({ status: 400, description: 'Invalid format' })
  async getProductsReport(@Query('format') format: string, @Res() res: any) {
    if (format === 'excel') {
      return this.reportsService.exportProductsExcel(res);
    } else if (format === 'pdf') {
      return this.reportsService.exportProductsPdf(res);
    } else {
      throw new BadRequestException("Invalid format. Use 'excel' or 'pdf'.");
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Export stock transaction logs report as Excel or PDF' })
  @ApiQuery({ name: 'format', enum: ['excel', 'pdf'], required: true, description: 'File format of report' })
  @ApiResponse({ status: 200, description: 'File stream response' })
  @ApiResponse({ status: 400, description: 'Invalid format' })
  async getHistoryReport(@Query('format') format: string, @Res() res: any) {
    if (format === 'excel') {
      return this.reportsService.exportHistoryExcel(res);
    } else if (format === 'pdf') {
      return this.reportsService.exportHistoryPdf(res);
    } else {
      throw new BadRequestException("Invalid format. Use 'excel' or 'pdf'.");
    }
  }
}
