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
  console.log('🚀 MIDDLEWARE: Production deployment active');

  // Skip maintenance mode check in production to avoid database calls
  const isMaintenanceMode = false;
  
  let isValidSession = false;
  let res = NextResponse.next();

  // Verify session if cookie exists
  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      isValidSession = true;
      
      // Refresh the session if valid and it's a GET request
      if (request.method === 'GET') {
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
      }
    } catch (error) {
      logJWTError(error, 'middleware session refresh');
      console.log('❌ MIDDLEWARE: JWT verification failed');
      isValidSession = false;
      // Clear invalid session cookie
      res.cookies.delete('session');
    }
  }

  // Check if protected route requires valid session
  if (isProtectedRoute && !isValidSession) {
    console.log('❌ MIDDLEWARE: No valid session for protected route, redirecting to sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  console.log('✅ MIDDLEWARE: Request processed successfully', { 
    pathname, 
    hasValidSession: isValidSession, 
    isProtected: isProtectedRoute 
  });

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
