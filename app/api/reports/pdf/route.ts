// ============================================================
// Vision Glass & Interior — PDF Report Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { auth } from '@/lib/auth';
import { reportQuerySchema } from '@/lib/validations';
import { preparePdfData, generatePdfHtml } from '@/lib/pdf';
import { apiError } from '@/lib/utils';
import mongoose from 'mongoose';
import type { IExpensePopulated } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const parsed = reportQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json(
        apiError('Invalid query parameters', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    const { employeeId, startDate, endDate, paymentMode } = parsed.data;
    const filter: Record<string, unknown> = {};

    if (employeeId) {
      filter.employee = new mongoose.Types.ObjectId(employeeId);
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }
    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .populate('employee', '_id employeeId name')
      .populate('addedBy', '_id name')
      .lean() as unknown as IExpensePopulated[];

    const pdfData = preparePdfData(expenses, startDate, endDate);
    const html = generatePdfHtml(pdfData);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Vision Glass & Interior-Report-${Date.now()}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF report error:', error);
    return NextResponse.json(apiError('Failed to generate PDF'), { status: 500 });
  }
}
