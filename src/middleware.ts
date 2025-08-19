
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, SUPERADMIN_COOKIE_VALUE } from '@/lib/auth-constants';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const allCookies = request.cookies.getAll();

  // Log details for every request to /admin/*
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Admin request to: ${pathname}`);
    console.log(`[Middleware] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Middleware] MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
    console.log(`[Middleware] ADMIN_USERNAME set: ${!!process.env.ADMIN_USERNAME}`);
  }

  // Allow requests to the login page itself, API routes, and static assets
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/setup') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // commonly for static files like .ico, .png
  ) {
    return NextResponse.next();
  }

  // Protect all other /admin/* routes (but NOT login or setup)
  if (pathname.startsWith('/admin')) {
    const sessionCookie = await request.cookies.get(SESSION_COOKIE_NAME);
    const sessionCookieValue = sessionCookie?.value;

    // If no session cookie, redirect to login
    if (!sessionCookieValue) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      loginUrl.searchParams.set('error', encodeURIComponent('Please log in to access this page.'));
      return NextResponse.redirect(loginUrl);
    }

    // If session cookie exists, let the layout handle validation
    // This prevents middleware from blocking valid sessions
    return NextResponse.next();
  }

  // For all other non-admin routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for some specific Next.js internals and static files.
     * This ensures middleware runs for all page navigations.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};
