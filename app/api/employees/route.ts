// ============================================================
// Vision Glass & Interior — Employees List & Create API
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { auth } from '@/lib/auth';
import { createEmployeeSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/employees — List all employees
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('active') !== 'false';

    const filter: Record<string, unknown> = {};
    if (activeOnly) filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      Employee.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      apiSuccess('Employees fetched successfully', employees, {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      })
    );
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(apiError('Failed to fetch employees'), { status: 500 });
  }
}

// POST /api/employees — Create employee
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation failed', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for duplicate email
    const existing = await Employee.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json(
        apiError('Employee with this email already exists'),
        { status: 409 }
      );
    }

    const employee = await Employee.create({
      ...parsed.data,
      department: parsed.data.department ?? undefined,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      apiSuccess('Employee created successfully', employee),
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/employees error:', error);
    return NextResponse.json(apiError('Failed to create employee'), { status: 500 });
  }
}
