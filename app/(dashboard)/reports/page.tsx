// ============================================================
// Vision Glass & Interior — Reports Page
// ============================================================

'use client';

import { useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function ReportsPage() {
  const { data: employeesData } = useEmployees({ limit: 100 });
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [downloading, setDownloading] = useState<'pdf' | 'csv' | null>(null);

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...(employeesData?.data?.map((emp: { _id: { toString(): string }; name: string }) => ({
      value: emp._id.toString(),
      label: emp.name,
    })) || []),
  ];

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (employeeId) params.set('employeeId', employeeId);
    if (startDate) params.set('startDate', new Date(startDate).toISOString());
    if (endDate) params.set('endDate', new Date(endDate).toISOString());
    if (paymentMode) params.set('paymentMode', paymentMode);
    return params.toString();
  };

  const handleDownload = async (type: 'pdf' | 'csv') => {
    setDownloading(type);
    try {
      const query = buildQueryString();
      const url = `/api/reports/${type}?${query}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Vision Glass & Interior-Report.${type === 'pdf' ? 'html' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#f9fafb]">Reports</h2>
        <p className="text-sm text-[#4b5563] mt-0.5">
          Generate and download expense reports
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-[#f9fafb] mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Employee"
            options={employeeOptions}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Payment Mode"
            options={[
              { value: '', label: 'All' },
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
            ]}
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          />
        </div>
      </Card>

      {/* Download Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* PDF Card */}
        <Card className="p-6 group hover:border-[rgba(99,102,241,0.3)] transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-[10px] bg-[rgba(99,102,241,0.15)] text-[#6366f1] group-hover:scale-110 transition-transform duration-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M10 12l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#f9fafb]">PDF Report</h3>
              <p className="text-sm text-[#4b5563] mt-1">
                Comprehensive expense report with company header, per-employee breakdown tables, subtotals, and grand total.
              </p>
              <Button
                className="mt-4"
                onClick={() => handleDownload('pdf')}
                loading={downloading === 'pdf'}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                }
              >
                Download PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* CSV Card */}
        <Card className="p-6 group hover:border-[rgba(16,185,129,0.3)] transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-[10px] bg-[rgba(16,185,129,0.15)] text-[#10b981] group-hover:scale-110 transition-transform duration-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="10" y1="9" x2="10" y2="9" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#f9fafb]">CSV Export</h3>
              <p className="text-sm text-[#4b5563] mt-1">
                Spreadsheet-compatible export with all expense data. Import into Excel, Google Sheets, or any analytics tool.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleDownload('csv')}
                loading={downloading === 'csv'}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                }
              >
                Download CSV
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-5 border-[rgba(245,158,11,0.2)]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[6px] bg-[rgba(245,158,11,0.15)] text-[#f59e0b] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#f9fafb]">Automated Reports</p>
            <p className="text-xs text-[#4b5563] mt-1">
              Daily reports are automatically sent at 8:00 PM IST. Monthly summaries are sent on the 1st of each month.
              Configure recipients via the <code className="text-[#22d3ee] bg-[rgba(34,211,238,0.1)] px-1.5 py-0.5 rounded text-xs">Admin</code>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
