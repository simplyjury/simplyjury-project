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
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    throw new Error('Not authenticated');
  }

  try {
    const session = await verifyToken(sessionCookie.value);
    
    if (!session?.userId) {
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

    if (!user[0]) {
      throw new Error('User not found');
    }

    return user[0] as AuthenticatedUser;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

/**
 * Require specific user role - redirects if unauthorized
 */
export async function requireRole(allowedRoles: UserRole | UserRole[], redirectTo: string = '/dashboard') {
  try {
    const user = await getCurrentUser();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user.userType)) {
      redirect(redirectTo);
    }
    
    return user;
  } catch (error) {
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
