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

  // Skip maintenance mode check in production to avoid database calls
  const isMaintenanceMode = false;
  
  // Maintenance mode disabled in production

  // Skip debug logging in production to avoid database calls

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
