// ============================================================
// Vision Glass & Interior — PDF Generation Logic
// ============================================================

import { formatDate, formatCurrency } from '@/lib/utils';
import type { IExpensePopulated } from '@/types';

export interface PdfReportData {
  title: string;
  dateRange: string;
  generatedAt: string;
  expenses: IExpensePopulated[];
  cashTotal: number;
  upiTotal: number;
  grandTotal: number;
  employeeBreakdown: {
    name: string;
    employeeId: string;
    expenses: {
      date: string;
      description: string;
      paymentMode: string;
      amount: string;
    }[];
    subtotal: string;
  }[];
}

export function preparePdfData(
  expenses: IExpensePopulated[],
  startDate?: string,
  endDate?: string
): PdfReportData {
  const dateRange = startDate && endDate
    ? `${formatDate(startDate, 'dd MMM yyyy')} — ${formatDate(endDate, 'dd MMM yyyy')}`
    : startDate
      ? `From ${formatDate(startDate, 'dd MMM yyyy')}`
      : endDate
        ? `Until ${formatDate(endDate, 'dd MMM yyyy')}`
        : 'All Time';

  const cashTotal = expenses
    .filter((e) => e.paymentMode === 'cash')
    .reduce((sum, e) => sum + e.amount, 0);
  const upiTotal = expenses
    .filter((e) => e.paymentMode === 'upi')
    .reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = cashTotal + upiTotal;

  // Group expenses by employee
  const employeeMap = new Map<
    string,
    { name: string; employeeId: string; expenses: IExpensePopulated[] }
  >();

  for (const expense of expenses) {
    const empId = expense.employee?._id?.toString() || 'unknown';
    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        name: expense.employee?.name || 'Unknown',
        employeeId: expense.employee?.employeeId || '',
        expenses: [],
      });
    }
    employeeMap.get(empId)!.expenses.push(expense);
  }

  const employeeBreakdown = Array.from(employeeMap.values()).map((emp) => ({
    name: emp.name,
    employeeId: emp.employeeId,
    expenses: emp.expenses.map((e) => ({
      date: formatDate(e.date, 'dd MMM yyyy'),
      description: e.description,
      paymentMode: e.paymentMode.toUpperCase(),
      amount: formatCurrency(e.amount),
    })),
    subtotal: formatCurrency(emp.expenses.reduce((sum, e) => sum + e.amount, 0)),
  }));

  return {
    title: 'Vision Glass & Interiors — Expense Report',
    dateRange,
    generatedAt: formatDate(new Date(), 'dd MMM yyyy, hh:mm a'),
    expenses,
    cashTotal,
    upiTotal,
    grandTotal,
    employeeBreakdown,
  };
}

/**
 * Generate PDF as HTML (server-side fallback since @react-pdf/renderer
 * doesn't work in serverless route handlers)
 */
export function generatePdfHtml(data: PdfReportData): string {
  const employeeSections = data.employeeBreakdown
    .map(
      (emp) => `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #6366f1; margin-bottom: 8px; font-size: 14px;">
        ${emp.name} (${emp.employeeId})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Date</th>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Description</th>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Payment</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${emp.expenses
            .map(
              (e) => `
            <tr>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">${e.date}</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">${e.description}</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">${e.paymentMode}</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">${e.amount}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="background: #f8fafc; font-weight: 600;">
            <td colspan="3" style="padding: 8px; border-top: 2px solid #e2e8f0;">Subtotal</td>
            <td style="padding: 8px; border-top: 2px solid #e2e8f0; text-align: right;">${emp.subtotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        @page { margin: 40px; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 3px solid #6366f1; }
        .header h1 { color: #6366f1; margin: 0 0 4px; font-size: 22px; }
        .header p { color: #64748b; margin: 2px 0; font-size: 12px; }
        .summary { display: flex; justify-content: center; gap: 24px; margin: 24px 0; }
        .summary-box { text-align: center; padding: 16px 32px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .summary-value { font-size: 20px; font-weight: 700; color: #6366f1; }
        .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <p>${data.dateRange}</p>
        <p>Generated: ${data.generatedAt}</p>
      </div>

      <table style="width: 100%; margin-bottom: 32px;">
        <tr>
          <td style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${formatCurrency(data.cashTotal)}</div>
            <div style="font-size: 11px; color: #64748b;">Cash Total</div>
          </td>
          <td style="width: 16px;"></td>
          <td style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${formatCurrency(data.upiTotal)}</div>
            <div style="font-size: 11px; color: #64748b;">UPI Total</div>
          </td>
          <td style="width: 16px;"></td>
          <td style="text-align: center; padding: 16px; background: #6366f1; border-radius: 8px;">
            <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${formatCurrency(data.grandTotal)}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.8);">Grand Total</div>
          </td>
        </tr>
      </table>

      ${employeeSections}

      <div class="footer">
        <p>Vision Glass & Interior — Expense Management System | Report generated on ${data.generatedAt}</p>
      </div>
    </body>
    </html>
  `;
}
