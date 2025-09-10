import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

/**
 * Debug utility to help diagnose authentication issues in production
 * Add this to your middleware temporarily to get detailed logging
 */
export async function debugAuthIssue(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  
  console.log('🔍 Auth Debug Info:', {
    pathname,
    hasSessionCookie: !!sessionCookie,
    cookieValue: sessionCookie?.value ? 'EXISTS' : 'MISSING',
    cookieLength: sessionCookie?.value?.length || 0,
    userAgent: request.headers.get('user-agent'),
    host: request.headers.get('host'),
    protocol: request.url.startsWith('https') ? 'https' : 'http'
  });

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      console.log('✅ Token verification successful:', {
        userId: parsed.userId,
        email: parsed.email,
        userType: parsed.userType,
        exp: parsed.exp,
        iat: parsed.iat
      });
      return { success: true, user: parsed };
    } catch (error) {
      console.error('❌ Token verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        authSecretExists: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length || 0
      });
      return { success: false, error };
    }
  }
  
  return { success: false, error: 'No session cookie' };
}

/**
 * Enhanced error logging for JWT verification
 */
export function logJWTError(error: any, context: string) {
  console.error(`🚨 JWT Error in ${context}:`, {
    message: error?.message,
    name: error?.name,
    code: error?.code,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    authSecretConfigured: !!process.env.AUTH_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
}
