'use client';

import React, { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { showToast } from '@/store/toastStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (reportType: 'products' | 'history', format: 'excel' | 'pdf') => {
    const key = `${reportType}-${format}`;
    setDownloading(key);
    
    try {
      const endpoint = `/reports/${reportType}`;
      const response = await api.get(endpoint, {
        params: { format },
        responseType: 'blob', // Critical for handling binary files
      });

      // Define default file extensions
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.${ext}`;

      // Create browser link to initiate local save
      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success(`${reportType.toUpperCase()} ${format.toUpperCase()} report exported!`);
    } catch (error) {
      showToast.error(`Failed to export ${reportType} report.`);
    } finally {
      setDownloading(null);
    }
  };

  const reportsList = [
    {
      id: 'products',
      title: 'Product Catalog Valuation',
      desc: 'Export inventory audit summaries, pricing details, active quantities, and alerts statuses for all items.',
      icon: FileSpreadsheet,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    },
    {
      id: 'history',
      title: 'Stock Transactions History',
      desc: 'Export full audit trail transactions containing timestamps, quantities adjusted, previous/new balances, and employee signatures.',
      icon: FileText,
      color: 'text-teal-400 border-teal-500/20 bg-teal-500/10',
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Export Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Download current catalog valuation sheets or historical movements logs in spreadsheet and document formats
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reportsList.map((report) => {
            const Icon = report.icon;
            const isExcelLoading = downloading === `${report.id}-excel`;
            const isPdfLoading = downloading === `${report.id}-pdf`;

            return (
              <Card key={report.id} className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${report.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg text-white">{report.title}</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400 mt-2.5 leading-relaxed text-sm">
                    {report.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4">
                  {/* Excel Download button */}
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(report.id as any, 'excel')}
                    disabled={downloading !== null}
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 justify-center gap-2 cursor-pointer"
                  >
                    {isExcelLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download Excel</span>
                  </Button>

                  {/* PDF Download button */}
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(report.id as any, 'pdf')}
                    disabled={downloading !== null}
                    className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 justify-center gap-2 cursor-pointer"
                  >
                    {isPdfLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download PDF</span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
