import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { SystemSettingsService } from '@/lib/services/system-settings-service';
import { debugAuthIssue, logJWTError } from '@/lib/debug/auth-debug';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  console.log('🔍 MIDDLEWARE: Processing request:', { pathname, hasSession: !!sessionCookie, isProtected: isProtectedRoute });

  // Check maintenance mode first
  let isMaintenanceMode = false;
  try {
    isMaintenanceMode = await SystemSettingsService.getMaintenanceMode();
    console.log('🔍 MIDDLEWARE: Maintenance mode check:', isMaintenanceMode);
  } catch (error) {
    console.error('❌ MIDDLEWARE: Maintenance mode check failed:', error);
    isMaintenanceMode = false;
  }
  
  // Allow access to maintenance page and API routes during maintenance
  if (isMaintenanceMode && !pathname.startsWith('/maintenance') && !pathname.startsWith('/api')) {
    // If user is trying to access sign-in during maintenance, allow it
    if (pathname === '/sign-in') {
      // Allow access to sign-in page during maintenance
      // The sign-in logic will handle admin-only access
    } else {
      // Check if user is admin before redirecting to maintenance
      if (sessionCookie) {
        try {
          const parsed = await verifyToken(sessionCookie.value);
          if (parsed?.userId) {
            const isAdmin = await SystemSettingsService.isUserAdmin(parsed.userId);
            if (isAdmin) {
              // Admin user - allow access during maintenance
            } else {
              // Non-admin user - redirect to maintenance
              return NextResponse.redirect(new URL('/maintenance', request.url));
            }
          } else {
            // Invalid session - redirect to maintenance
            return NextResponse.redirect(new URL('/maintenance', request.url));
          }
        } catch (error) {
          // Invalid session - redirect to maintenance
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      } else {
        // No session - redirect to maintenance
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  }

  // If not in maintenance mode and trying to access maintenance page, redirect to home
  if (!isMaintenanceMode && pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add debug logging for protected routes
  if (isProtectedRoute) {
    const debugResult = await debugAuthIssue(request);
    if (!debugResult.success) {
      console.log('🔄 Redirecting to sign-in due to auth failure');
    }
  }

  // Check for session cookie
  console.log('🔍 MIDDLEWARE: Session cookie check:', { 
    hasCookie: !!sessionCookie,
    cookieValue: sessionCookie?.value ? `${sessionCookie.value.substring(0, 20)}...` : 'none'
  });

  if (!sessionCookie) {
    console.log('❌ MIDDLEWARE: No session cookie, redirecting to sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      logJWTError(error, 'middleware session refresh');
      console.log('❌ MIDDLEWARE: JWT verification failed, redirecting to sign-in');
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
