// ============================================================
// Vision Glass & Interior — CSV Report Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { auth } from '@/lib/auth';
import { reportQuerySchema } from '@/lib/validations';
import { generateExpenseCSV } from '@/lib/csv';
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
      .lean() as unknown as IExpensePopulated[];

    const csv = generateExpenseCSV(expenses);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Vision Glass & Interior-Expenses-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV report error:', error);
    return NextResponse.json(apiError('Failed to generate CSV'), { status: 500 });
  }
}
