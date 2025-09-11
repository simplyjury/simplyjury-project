import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  
  console.log('🔍 SIMPLIFIED MIDDLEWARE:', {
    pathname,
    isProtectedRoute,
    timestamp: new Date().toISOString(),
    hasAuthSecret: !!process.env.AUTH_SECRET
  });

  // Only check authentication for protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie found - redirecting');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Verify token without refreshing
  try {
    const sessionData = await verifyToken(sessionCookie.value);
    
    // Simple expiration check
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      console.log('❌ Session expired - redirecting');
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('session');
      return response;
    }

    console.log('✅ Valid session found:', {
      userId: sessionData.userId,
      email: sessionData.email,
      expires: sessionData.expires
    });

    // Don't refresh token - let API routes handle that
    return NextResponse.next();
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
