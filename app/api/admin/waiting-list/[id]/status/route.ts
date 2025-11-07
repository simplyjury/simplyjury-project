// Epic 07 - Update waiting list entry status
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
    const { status } = body;

    if (!status || !['pending', 'contacted', 'converted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Update status
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // If converting, set converted_at timestamp
    if (status === 'converted') {
      updateData.convertedAt = new Date();
    }

    await db
      .update(subscriptionWaitingList)
      .set(updateData)
      .where(eq(subscriptionWaitingList.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour'
    });
  } catch (error) {
    console.error('Error updating waiting list status:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
