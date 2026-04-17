// ============================================================
// Vision Glass & Interior — CSV Generation
// ============================================================

import Papa from 'papaparse';
import { formatDate, toRupees } from '@/lib/utils';
import type { IExpensePopulated } from '@/types';

interface CsvExpenseRow {
  Date: string;
  Employee: string;
  EmployeeID: string;
  Description: string;
  PaymentMode: string;
  Amount: string;
}

export function generateExpenseCSV(expenses: IExpensePopulated[]): string {
  const rows: CsvExpenseRow[] = expenses.map((expense) => ({
    Date: formatDate(expense.date, 'yyyy-MM-dd'),
    Employee: expense.employee?.name || 'Unknown',
    EmployeeID: expense.employee?.employeeId || '',
    Description: expense.description,
    PaymentMode: expense.paymentMode.toUpperCase(),
    Amount: toRupees(expense.amount).toFixed(2),
  }));

  // Add total row
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push({
    Date: '',
    Employee: '',
    EmployeeID: '',
    Description: 'GRAND TOTAL',
    PaymentMode: '',
    Amount: toRupees(totalAmount).toFixed(2),
  });

  return Papa.unparse(rows, {
    quotes: true,
    header: true,
  });
}
