// ============================================================
// Vision Glass & Interior — Single Expense API (GET, PATCH, DELETE)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { auth } from '@/lib/auth';
import { updateExpenseSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/expenses/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const expense = await Expense.findById(id)
      .populate('employee', '_id employeeId name email')
      .populate('addedBy', '_id name')
      .lean();

    if (!expense) {
      return NextResponse.json(apiError('Expense not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess('Expense fetched', expense));
  } catch (error) {
    console.error('GET /api/expenses/[id] error:', error);
    return NextResponse.json(apiError('Failed to fetch expense'), { status: 500 });
  }
}

// PATCH /api/expenses/[id] — Update expense
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation failed', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) {
      updateData.date = new Date(parsed.data.date);
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('employee', '_id employeeId name')
      .populate('addedBy', '_id name')
      .lean();

    if (!expense) {
      return NextResponse.json(apiError('Expense not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess('Expense updated successfully', expense));
  } catch (error) {
    console.error('PATCH /api/expenses/[id] error:', error);
    return NextResponse.json(apiError('Failed to update expense'), { status: 500 });
  }
}

// DELETE /api/expenses/[id] — Admin only
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(apiError('Admin access required'), { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const expense = await Expense.findByIdAndDelete(id).lean();

    if (!expense) {
      return NextResponse.json(apiError('Expense not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess('Expense deleted successfully', expense));
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json(apiError('Failed to delete expense'), { status: 500 });
  }
}
