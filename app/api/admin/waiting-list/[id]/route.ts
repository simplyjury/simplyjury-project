// Epic 07 - Delete waiting list entry
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { db } from '@/lib/db/drizzle';
import { subscriptionWaitingList } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Delete entry
    await db
      .delete(subscriptionWaitingList)
      .where(eq(subscriptionWaitingList.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Entrée supprimée'
    });
  } catch (error) {
    console.error('Error deleting waiting list entry:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
