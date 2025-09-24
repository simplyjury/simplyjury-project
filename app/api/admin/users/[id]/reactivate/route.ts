import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, isNotNull } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionCookie.value);
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const adminUser = await db
      .select({ userType: users.userType })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!adminUser[0] || adminUser[0].userType !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user to reactivate
    const userToReactivate = await db
      .select({ 
        id: users.id, 
        name: users.name, 
        email: users.email, 
        userType: users.userType,
        deletedAt: users.deletedAt 
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userToReactivate[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userToReactivate[0];

    // Check if user is not deactivated
    if (!user.deletedAt) {
      return NextResponse.json(
        { error: 'User is not deactivated' },
        { status: 400 }
      );
    }

    // Reactivate user (remove logical deletion and validate account)
    await db
      .update(users)
      .set({ 
        deletedAt: null,
        validationStatus: 'validated', // Reactivation implies validation
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: 'User reactivated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
