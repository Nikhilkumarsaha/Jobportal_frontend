import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = request.cookies.get('user')?.value ? JSON.parse(request.cookies.get('user')?.value || '{}') : null;

  const publicPaths = ['/auth/login', '/auth/register', '/'];
  if (publicPaths.includes(request.nextUrl.pathname)) {
    if (token) {
      return NextResponse.redirect(
        new URL(user?.userType === 'employer' ? '/employer-dashboard' : '/dashboard', request.url)
      );
    }
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  const employerRoutes = ['/employer-dashboard', '/employer'];
  if (employerRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (user?.userType !== 'employer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  const jobseekerRoutes = ['/dashboard', '/applications'];
  if (jobseekerRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (user?.userType !== 'jobseeker') {
      return NextResponse.redirect(new URL('/employer-dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};