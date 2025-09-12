import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export type UserRole = 'jury' | 'centre' | 'admin';

export interface AuthenticatedUser {
  id: number;
  email: string;
  userType: UserRole;
  profileCompleted: boolean;
}

/**
 * Get the current authenticated user from session
 * Throws error if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  
  // Handle production cookie name changes (same as middleware)
  let sessionCookie = cookieStore.get('session');
  if (!sessionCookie && process.env.NODE_ENV === 'production') {
    sessionCookie = cookieStore.get('__Secure-session') || 
                   cookieStore.get('__Host-session');
  }
  
  console.log('🔍 getCurrentUser: Cookie check:', {
    hasSession: !!sessionCookie,
    cookieName: sessionCookie?.name,
    allCookies: Array.from(cookieStore.getAll()).map(c => c.name),
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!sessionCookie) {
    console.log('❌ getCurrentUser: No session cookie found');
    throw new Error('Not authenticated');
  }

  try {
    const session = await verifyToken(sessionCookie.value);
    console.log('🔍 getCurrentUser: Session verified:', { userId: session?.userId, userType: session?.userType });
    
    if (!session?.userId) {
      console.log('❌ getCurrentUser: Invalid session - no userId');
      throw new Error('Invalid session');
    }

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        userType: users.userType,
        profileCompleted: users.profileCompleted,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    console.log('🔍 getCurrentUser: Database query result:', { 
      found: !!user[0], 
      userType: user[0]?.userType,
      userId: user[0]?.id 
    });

    if (!user[0]) {
      console.log('❌ getCurrentUser: User not found in database');
      throw new Error('User not found');
    }

    return user[0] as AuthenticatedUser;
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Require specific user role - redirects if unauthorized
 */
export async function requireRole(allowedRoles: UserRole | UserRole[], redirectTo: string = '/dashboard') {
  try {
    console.log('🔍 requireRole: Checking roles:', { allowedRoles, redirectTo });
    const user = await getCurrentUser();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    console.log('🔍 requireRole: User check result:', { 
      userType: user.userType, 
      allowedRoles: roles,
      hasAccess: roles.includes(user.userType)
    });
    
    if (!roles.includes(user.userType)) {
      console.log('🔄 requireRole: Redirecting due to insufficient role');
      redirect(redirectTo);
    }
    
    console.log('✅ requireRole: Access granted');
    return user;
  } catch (error) {
    console.error('❌ requireRole: Error, redirecting to sign-in:', error);
    redirect('/sign-in');
  }
}

/**
 * Check if user has specific role without redirecting
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.userType);
  } catch (error) {
    return false;
  }
}

/**
 * Protect center-only routes
 */
export async function requireCenter() {
  return requireRole('centre', '/dashboard?profile=jury');
}

/**
 * Protect jury-only routes  
 */
export async function requireJury() {
  return requireRole('jury', '/dashboard');
}

/**
 * Protect admin-only routes
 */
export async function requireAdmin() {
  return requireRole('admin', '/dashboard');
}
