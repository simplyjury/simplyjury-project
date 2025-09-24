import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';

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

    // Get confirmation text from request body
    const { confirmationText } = await request.json();
    
    // Get user to deactivate
    const userToDeactivate = await db
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

    if (!userToDeactivate[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userToDeactivate[0];

    // Check if user is already deactivated
    if (user.deletedAt) {
      return NextResponse.json(
        { error: 'User is already deactivated' },
        { status: 400 }
      );
    }

    // Prevent deactivating admin users
    if (user.userType === 'admin') {
      return NextResponse.json(
        { error: 'Cannot deactivate admin users' },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    if (user.id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Verify confirmation text
    const expectedText = `desactiver le user ${user.name || user.email}`;
    if (confirmationText.toLowerCase().trim() !== expectedText.toLowerCase()) {
      return NextResponse.json(
        { error: 'Confirmation text does not match' },
        { status: 400 }
      );
    }

    // Deactivate user (logical deletion)
    await db
      .update(users)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: 'User deactivated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
