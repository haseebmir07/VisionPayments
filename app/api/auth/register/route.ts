// ============================================================
// Vision Glass & Interior — Register API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation failed', parsed.error.issues),
        { status: 400 }
      );
    }

    await dbConnect();

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        apiError('User with this email already exists'),
        { status: 409 }
      );
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'user',
    });

    const userSafe = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      apiSuccess('Registration successful', userSafe),
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      apiError('Internal server error'),
      { status: 500 }
    );
  }
}
