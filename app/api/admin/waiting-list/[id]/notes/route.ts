// Epic 07 - Update waiting list entry notes
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { db } from '@/lib/db/drizzle';
import { subscriptionWaitingList } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
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
    const body = await request.json();
    const { notes } = body;

    // Update notes
    await db
      .update(subscriptionWaitingList)
      .set({
        contactNotes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(subscriptionWaitingList.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Notes mises à jour'
    });
  } catch (error) {
    console.error('Error updating waiting list notes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
