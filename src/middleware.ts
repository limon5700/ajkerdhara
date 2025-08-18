
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, SUPERADMIN_COOKIE_VALUE } from '@/lib/auth-constants';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const allCookies = request.cookies.getAll();

  // Log details for every request to /admin/*
  if (pathname.startsWith('/admin')) {
    
  }

  // Allow requests to the login page itself, API routes, and static assets
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // commonly for static files like .ico, .png
  ) {

    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = await request.cookies.get(SESSION_COOKIE_NAME);
    const sessionCookieValue = sessionCookie?.value;
    const serverAdminUsername = process.env.ADMIN_USERNAME;
    const mongodbUri = process.env.MONGODB_URI;

    let reasonForRedirect = '';

    if (!sessionCookieValue) {
      reasonForRedirect = `Session cookie '${SESSION_COOKIE_NAME}' not found.`;
    } else if (sessionCookieValue === SUPERADMIN_COOKIE_VALUE) {
      // Check SuperAdmin session
      if (!serverAdminUsername) {
        reasonForRedirect = `CRITICAL SERVER MISCONFIGURATION: '${SUPERADMIN_COOKIE_VALUE}' found, but ADMIN_USERNAME is NOT SET on server. Session is invalid.`;
        console.error(`[Middleware] ${reasonForRedirect}`);
      }
    } else if (sessionCookieValue.startsWith('user_session:')) {
      // Check database user session
      if (!mongodbUri) {
        reasonForRedirect = `Database user session found, but MONGODB_URI is NOT SET on server. Cannot validate session.`;
        console.error(`[Middleware] ${reasonForRedirect}`);
      }
      // For database users, we'll let the layout handle the validation
      // since we can't easily validate the user ID here without database access
    } else {
      reasonForRedirect = `Invalid session cookie format: '${sessionCookieValue}'`;
    }

    if (reasonForRedirect) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      if (reasonForRedirect.includes('CRITICAL SERVER MISCONFIGURATION')) {
        loginUrl.searchParams.set('configError', encodeURIComponent('SuperAdmin session validation failed due to server misconfiguration.'));
      } else {
        loginUrl.searchParams.set('error', encodeURIComponent('Session invalid or expired. Please log in again.'));
      }
      return NextResponse.redirect(loginUrl);
    }

    // If all checks pass
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
