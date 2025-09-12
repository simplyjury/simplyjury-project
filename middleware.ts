import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { SystemSettingsService } from '@/lib/services/system-settings-service';
import { debugAuthIssue, logJWTError } from '@/lib/debug/auth-debug';

const protectedRoutes = ['/dashboard'];
const excludedRoutes = ['/dashboard/search']; // Allow public access to search

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // PRODUCTION DEBUG: Log all cookies and environment
  console.log('🔍 MIDDLEWARE DEBUG:', {
    pathname,
    nodeEnv: process.env.NODE_ENV,
    host: request.headers.get('host'),
    allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value?.substring(0, 20) + '...'])),
    cookieNames: request.cookies.getAll().map(c => c.name)
  });
  
  // Handle production cookie name changes (from Next.js report)
  let sessionCookie = request.cookies.get('session');
  if (!sessionCookie && process.env.NODE_ENV === 'production') {
    sessionCookie = request.cookies.get('__Secure-session') || 
                   request.cookies.get('__Host-session');
  }
  
  console.log('🔍 MIDDLEWARE SESSION CHECK:', {
    hasSessionCookie: !!sessionCookie,
    cookieName: sessionCookie?.name,
    cookieValue: sessionCookie?.value?.substring(0, 20) + '...'
  });
  
  // Check if route is protected and not excluded
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && 
                          !excludedRoutes.some(route => pathname.startsWith(route));

  // Enhanced production debugging
  console.log('🔍 MIDDLEWARE: Processing request:', { 
    pathname, 
    hasSession: !!sessionCookie, 
    isProtected: isProtectedRoute,
    environment: process.env.NODE_ENV,
    host: request.headers.get('host'),
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
    cookieValue: sessionCookie?.value ? `${sessionCookie.value.substring(0, 20)}...` : 'none'
  });

  // Skip maintenance mode check in production to avoid database calls
  const isMaintenanceMode = false;
  
  // Maintenance mode disabled in production

  // Skip debug logging in production to avoid database calls

  if (isProtectedRoute && !sessionCookie) {
    console.log('❌ MIDDLEWARE: No session cookie, redirecting to sign-in', {
      pathname,
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 10) + '...'])),
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-host': request.headers.get('x-forwarded-host')
      }
    });
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();
  
  // Disable caching for proper cookie handling (from Next.js report)
  res.headers.set("x-middleware-cache", "no-cache");

  if (sessionCookie && request.method === 'GET') {
    console.log('🔍 MIDDLEWARE: Attempting JWT verification for:', {
      pathname,
      cookieLength: sessionCookie.value.length,
      cookieStart: sessionCookie.value.substring(0, 30) + '...',
      authSecretExists: !!process.env.AUTH_SECRET,
      authSecretLength: process.env.AUTH_SECRET?.length
    });
    
    try {
      const parsed = await verifyToken(sessionCookie.value);
      console.log('✅ MIDDLEWARE: JWT verification successful:', {
        pathname,
        userId: parsed?.userId,
        userType: parsed?.userType,
        hasExpires: !!parsed?.expires
      });
      
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const cookieOptions: any = {
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: expiresInOneDay
      };

      // Handle domain for Vercel production (avoid .vercel.app domain issues)
      if (process.env.NODE_ENV === 'production') {
        const host = request.headers.get('host');
        if (host && !host.includes('.vercel.app')) {
          cookieOptions.domain = host;
        }
      }

      res.cookies.set(cookieOptions);
    } catch (error) {
      logJWTError(error, 'middleware session refresh');
      console.log('❌ MIDDLEWARE: JWT verification failed, redirecting to sign-in', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        pathname,
        cookieExists: !!sessionCookie,
        cookieLength: sessionCookie?.value?.length,
        authSecretExists: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length
      });
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
