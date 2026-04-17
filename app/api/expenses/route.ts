// ============================================================
// Vision Glass & Interior — Expenses List & Create API
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { auth } from '@/lib/auth';
import { createExpenseSchema, expenseQuerySchema } from '@/lib/validations';
import {
  apiSuccess,
  apiError,
  startOfDayUTC,
  endOfDayUTC,
  startOfMonthUTC,
  endOfMonthUTC,
} from '@/lib/utils';
import mongoose from 'mongoose';

// GET /api/expenses — Filtered list with aggregates
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

    const parsed = expenseQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json(
        apiError('Invalid query parameters', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    const { employeeId, startDate, endDate, paymentMode, page, limit } = parsed.data;

    // Build filter
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

    // Fetch expenses with pagination
    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('employee', '_id employeeId name')
        .populate('addedBy', '_id name')
        .lean(),
      Expense.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Compute aggregates
    const now = new Date();
    const todayStart = startOfDayUTC(now);
    const todayEnd = endOfDayUTC(now);
    const monthStart = startOfMonthUTC(now);
    const monthEnd = endOfMonthUTC(now);

    const [dailyAgg, monthlyAgg, grandAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { ...filter, date: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { ...filter, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const aggregates = {
      daily: dailyAgg[0]?.total || 0,
      monthly: monthlyAgg[0]?.total || 0,
      grand: grandAgg[0]?.total || 0,
    };

    return NextResponse.json(
      apiSuccess('Expenses fetched successfully', { expenses, aggregates }, {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      })
    );
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json(apiError('Failed to fetch expenses'), { status: 500 });
  }
}

// POST /api/expenses — Create expense
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation failed', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    const expenseData = {
      employee: parsed.data.employee,
      amount: parsed.data.amount,
      description: parsed.data.description,
      paymentMode: parsed.data.paymentMode,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      addedBy: session.user.id,
    };

    const expense = await Expense.create(expenseData);

    const populated = await Expense.findById(expense._id)
      .populate('employee', '_id employeeId name')
      .populate('addedBy', '_id name')
      .lean();

    return NextResponse.json(
      apiSuccess('Expense created successfully', populated),
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json(apiError('Failed to create expense'), { status: 500 });
  }
}
