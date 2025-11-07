// Epic 07 - Join Waiting List API
// Allows users to join the waiting list for paid subscription tiers

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { db } from '@/lib/db/drizzle';
import { trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { WaitingListService } from '@/lib/services/waiting-list-service';
import { isValidEmail } from '@/lib/utils/subscription-helpers';
import type { WaitingListTrigger } from '@/lib/types/subscription';
import { sendWaitingListNotification } from '@/lib/actions/send-waiting-list-notification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, desiredTier, triggeredBy, currentContactsUsed } = body;

    // Validate required fields
    if (!email || !desiredTier) {
      return NextResponse.json(
        { error: 'Email et forfait souhaité requis' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validate desired tier
    if (desiredTier !== 'basic' && desiredTier !== 'pro') {
      return NextResponse.json(
        { error: 'Forfait invalide. Choisissez "basic" ou "pro"' },
        { status: 400 }
      );
    }

    // Try to get authenticated user (optional)
    let user = null;
    let trainingCenterId = null;

    try {
      user = await getCurrentUser();
      
      // If authenticated and is a center, get their center ID
      if (user && user.userType === 'centre') {
        const center = await db.query.trainingCenters.findFirst({
          where: eq(trainingCenters.userId, user.id),
        });
        trainingCenterId = center?.id || null;
      }
    } catch (error) {
      // Not authenticated - that's okay, we'll just collect email
      console.log('User not authenticated, proceeding with email only');
    }

    // Add to waiting list
    const result = await WaitingListService.addToWaitingList(
      {
        email,
        desiredTier,
        triggeredBy: triggeredBy as WaitingListTrigger,
        currentContactsUsed,
      },
      user?.id || undefined,
      trainingCenterId || undefined
    );

    if (!result.success) {
      // Check if already on list
      if (result.code === 'ALREADY_ON_WAITING_LIST') {
        return NextResponse.json(
          { 
            error: result.error,
            code: result.code,
          },
          { status: 409 } // Conflict
        );
      }

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Send email notification to admins
    try {
      // Get center name if available
      let centerName: string | undefined;
      if (trainingCenterId) {
        const center = await db.query.trainingCenters.findFirst({
          where: eq(trainingCenters.id, trainingCenterId),
        });
        centerName = center?.name;
      }

      await sendWaitingListNotification({
        email,
        centerName,
        desiredTier,
        triggeredBy: triggeredBy as WaitingListTrigger,
        currentContactsUsed,
      });
      
      console.log('Waiting list notification sent to admins');
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send waiting list notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Vous avez été ajouté à la liste d\'attente. Nous vous contacterons bientôt !',
      data: result.data,
    });
  } catch (error) {
    console.error('Error in POST /api/subscription/waiting-list:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user is on waiting list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const desiredTier = searchParams.get('tier') as 'basic' | 'pro' | null;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Check if on waiting list
    const result = await WaitingListService.isOnWaitingList(
      email,
      desiredTier || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error in GET /api/subscription/waiting-list:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
