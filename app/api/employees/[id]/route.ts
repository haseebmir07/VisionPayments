// ============================================================
// Vision Glass & Interior — Single Employee API (GET, PATCH, DELETE)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import Expense from '@/models/Expense';
import { auth } from '@/lib/auth';
import { updateEmployeeSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/employees/[id] — Get single employee with expense summary
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const employee = await Employee.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!employee) {
      return NextResponse.json(apiError('Employee not found'), { status: 404 });
    }

    // Get expense summary for this employee
    const expenseSummary = await Expense.aggregate([
      { $match: { employee: employee._id } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgExpense: { $avg: '$amount' },
          lastExpenseDate: { $max: '$date' },
        },
      },
    ]);

    return NextResponse.json(
      apiSuccess('Employee fetched successfully', {
        ...employee,
        summary: expenseSummary[0] || {
          totalSpent: 0,
          totalExpenses: 0,
          avgExpense: 0,
          lastExpenseDate: null,
        },
      })
    );
  } catch (error) {
    console.error('GET /api/employees/[id] error:', error);
    return NextResponse.json(apiError('Failed to fetch employee'), { status: 500 });
  }
}

// PATCH /api/employees/[id] — Update employee
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation failed', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    // Check email uniqueness if email is being changed
    if (parsed.data.email) {
      const existing = await Employee.findOne({
        email: parsed.data.email,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          apiError('Another employee with this email already exists'),
          { status: 409 }
        );
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!employee) {
      return NextResponse.json(apiError('Employee not found'), { status: 404 });
    }

    return NextResponse.json(
      apiSuccess('Employee updated successfully', employee)
    );
  } catch (error) {
    console.error('PATCH /api/employees/[id] error:', error);
    return NextResponse.json(apiError('Failed to update employee'), { status: 500 });
  }
}

// DELETE /api/employees/[id] — Admin only
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

    // Soft delete — set isActive to false
    const employee = await Employee.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!employee) {
      return NextResponse.json(apiError('Employee not found'), { status: 404 });
    }

    return NextResponse.json(
      apiSuccess('Employee deactivated successfully', employee)
    );
  } catch (error) {
    console.error('DELETE /api/employees/[id] error:', error);
    return NextResponse.json(apiError('Failed to delete employee'), { status: 500 });
  }
}
