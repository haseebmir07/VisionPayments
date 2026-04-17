// ============================================================
// Vision Glass & Interior — Route Protection Middleware
// ============================================================

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const protectedRoutes = ['/dashboard', '/employees', '/expenses', '/reports'];
const protectedApiRoutes = ['/api/employees', '/api/expenses', '/api/reports'];
const authRoutes = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect API routes
  if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employees/:path*',
    '/expenses/:path*',
    '/reports/:path*',
    '/login',
    '/register',
    '/api/employees/:path*',
    '/api/expenses/:path*',
    '/api/reports/:path*',
  ],
};
