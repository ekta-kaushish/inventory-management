import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { StockHistory, StockHistoryDocument } from '../history/schemas/history.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockHistory.name) private readonly historyModel: Model<StockHistoryDocument>,
  ) {}

  async exportProductsExcel(res: Response): Promise<void> {
    try {
      const products = await this.productModel.find().sort({ productName: 1 }).exec();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Products Inventory');

      worksheet.columns = [
        { header: 'Product Name', key: 'productName', width: 25 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Company', key: 'company', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Purchase Price (₹)', key: 'purchasePrice', width: 18 },
        { header: 'Min Stock Level', key: 'minStock', width: 15 },
        { header: 'Stock Value (₹)', key: 'value', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      // Format header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' }, // Deep Blue
      };

      let totalValuation = 0;
      let totalQty = 0;

      products.forEach((p) => {
        const value = p.quantity * p.purchasePrice;
        totalValuation += value;
        totalQty += p.quantity;

        worksheet.addRow({
          productName: p.productName,
          sku: p.sku,
          company: p.company,
          category: p.category,
          quantity: p.quantity,
          purchasePrice: p.purchasePrice,
          minStock: p.minimumStockLevel,
          value: value,
          status: p.status,
        });
      });

      // Add summary row
      worksheet.addRow({}); // Empty row
      const summaryRow = worksheet.addRow({
        productName: 'Total Summary',
        quantity: totalQty,
        value: totalValuation,
      });
      summaryRow.font = { bold: true };
      
      // Formatting numbers
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.getCell('purchasePrice').numFmt = '₹#,##0.00';
          row.getCell('value').numFmt = '₹#,##0.00';
          row.getCell('quantity').numFmt = '#,##0';
        }
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Products_Inventory_Report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate Excel report');
    }
  }

  async exportProductsPdf(res: Response): Promise<void> {
    try {
      const products = await this.productModel.find().sort({ productName: 1 }).exec();
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Products_Inventory_Report.pdf');

      doc.pipe(res);

      // Title header
      doc.fillColor('#1E3A8A').fontSize(20).text('INVENTORY SYSTEM - PRODUCTS REPORT', { align: 'center' });
      doc.fillColor('#4B5563').fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Inventory Summary Blocks
      const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);
      const totalValuation = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
      const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
      const outOfStockCount = products.filter((p) => p.status === 'Out Of Stock').length;

      doc.fillColor('#000000').fontSize(12).text('Inventory Summary:', { underline: true });
      doc.fontSize(10).text(`• Total Products: ${products.length}`);
      doc.text(`• Total Stock Volume: ${totalQty} units`);
      doc.text(`• Total Stock Value (at Cost Price): Rs. ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      doc.text(`• Alert Statuses: ${lowStockCount} Low Stock, ${outOfStockCount} Out Of Stock`);
      doc.moveDown(2);

      // Render Table Headers
      const startX = 30;
      let startY = doc.y;

      const drawTableHeader = () => {
        doc.rect(startX, startY, 535, 20).fill('#1E3A8A');
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
        doc.text('Product Name', startX + 5, startY + 5, { width: 150 });
        doc.text('SKU', startX + 160, startY + 5, { width: 90 });
        doc.text('Category', startX + 255, startY + 5, { width: 80 });
        doc.text('Qty', startX + 340, startY + 5, { width: 40, align: 'right' });
        doc.text('Stock Value', startX + 385, startY + 5, { width: 60, align: 'right' });
        doc.text('Status', startX + 450, startY + 5, { width: 80, align: 'right' });
        startY += 20;
      };

      drawTableHeader();

      // Render Table Rows
      doc.font('Helvetica').fillColor('#000000');
      products.forEach((p, index) => {
        // Handle new page bounds
        if (startY > doc.page.height - 50) {
          doc.addPage();
          startY = 30;
          drawTableHeader();
          doc.font('Helvetica').fillColor('#000000');
        }

        // Zebra striping
        if (index % 2 === 1) {
          doc.rect(startX, startY, 535, 18).fill('#F3F4F6');
          doc.fillColor('#000000');
        }

        doc.text(p.productName.substring(0, 28), startX + 5, startY + 4, { width: 150 });
        doc.text(p.sku, startX + 160, startY + 4, { width: 90 });
        doc.text(p.category.substring(0, 14), startX + 255, startY + 4, { width: 80 });
        doc.text(p.quantity.toString(), startX + 340, startY + 4, { width: 40, align: 'right' });
        doc.text(`Rs. ${(p.quantity * p.purchasePrice).toFixed(2)}`, startX + 385, startY + 4, { width: 60, align: 'right' });

        // Color code status in PDF
        if (p.status === 'Out Of Stock') doc.fillColor('#EF4444');
        else if (p.status === 'Low Stock') doc.fillColor('#F59E0B');
        else doc.fillColor('#10B981');
        
        doc.font('Helvetica-Bold').text(p.status, startX + 450, startY + 4, { width: 80, align: 'right' });
        
        doc.font('Helvetica').fillColor('#000000');
        startY += 18;
      });

      doc.end();
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate PDF report');
    }
  }

  async exportHistoryExcel(res: Response): Promise<void> {
    try {
      const history = await this.historyModel
        .find()
        .sort({ createdAt: -1 })
        .populate('productId')
        .populate('userId')
        .exec();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stock History Log');

      worksheet.columns = [
        { header: 'Date & Time', key: 'dateTime', width: 22 },
        { header: 'Product Name', key: 'productName', width: 25 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Transaction Type', key: 'type', width: 15 },
        { header: 'Quantity Adjusted', key: 'quantity', width: 18 },
        { header: 'Previous Stock', key: 'prevStock', width: 15 },
        { header: 'New Stock', key: 'newStock', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 25 },
        { header: 'Modified By User', key: 'user', width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F766E' }, // Teal
      };

      history.forEach((h: any) => {
        worksheet.addRow({
          dateTime: h.createdAt ? new Date(h.createdAt).toLocaleString() : '',
          productName: h.productId?.productName || 'N/A',
          sku: h.productId?.sku || 'N/A',
          type: h.transactionType,
          quantity: h.quantity,
          prevStock: h.previousStock,
          newStock: h.newStock,
          remarks: h.remarks,
          user: h.userId?.name || 'N/A',
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Stock_History_Report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate Excel transaction history report');
    }
  }

  async exportHistoryPdf(res: Response): Promise<void> {
    try {
      const history = await this.historyModel
        .find()
        .sort({ createdAt: -1 })
        .populate('productId')
        .populate('userId')
        .exec();

      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Stock_History_Report.pdf');

      doc.pipe(res);

      doc.fillColor('#0F766E').fontSize(20).text('STOCK MOVEMENT HISTORY LOG', { align: 'center' });
      doc.fillColor('#4B5563').fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      const startX = 30;
      let startY = doc.y;

      const drawTableHeader = () => {
        doc.rect(startX, startY, 535, 20).fill('#0F766E');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        doc.text('Date & Time', startX + 5, startY + 6, { width: 110 });
        doc.text('Product Name (SKU)', startX + 120, startY + 6, { width: 140 });
        doc.text('Action', startX + 265, startY + 6, { width: 40 });
        doc.text('Qty', startX + 310, startY + 6, { width: 30, align: 'right' });
        doc.text('Prev/New', startX + 345, startY + 6, { width: 50, align: 'center' });
        doc.text('Remarks', startX + 400, startY + 6, { width: 75 });
        doc.text('User', startX + 480, startY + 6, { width: 50 });
        startY += 20;
      };

      drawTableHeader();

      doc.font('Helvetica').fillColor('#000000');
      history.forEach((h: any, index) => {
        if (startY > doc.page.height - 50) {
          doc.addPage();
          startY = 30;
          drawTableHeader();
          doc.font('Helvetica').fillColor('#000000');
        }

        if (index % 2 === 1) {
          doc.rect(startX, startY, 535, 18).fill('#F3F4F6');
          doc.fillColor('#000000');
        }

        const dateStr = h.createdAt ? new Date(h.createdAt).toLocaleString(undefined, {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }) : '';
        const prodName = h.productId ? `${h.productId.productName.substring(0, 16)} (${h.productId.sku})` : 'Deleted Product';

        doc.fontSize(8);
        doc.text(dateStr, startX + 5, startY + 5, { width: 110 });
        doc.text(prodName, startX + 120, startY + 5, { width: 140 });

        if (h.transactionType === 'IN') doc.fillColor('#10B981');
        else doc.fillColor('#EF4444');
        doc.font('Helvetica-Bold').text(h.transactionType, startX + 265, startY + 5, { width: 40 });
        
        doc.font('Helvetica').fillColor('#000000');
        doc.text(h.quantity.toString(), startX + 310, startY + 5, { width: 30, align: 'right' });
        doc.text(`${h.previousStock} -> ${h.newStock}`, startX + 345, startY + 5, { width: 50, align: 'center' });
        doc.text((h.remarks || '').substring(0, 16), startX + 400, startY + 5, { width: 75 });
        doc.text((h.userId?.name || 'N/A').substring(0, 10), startX + 480, startY + 5, { width: 50 });

        startY += 18;
      });

      doc.end();
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate PDF transaction log report');
    }
  }
}
