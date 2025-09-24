import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { sql, and, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get detailed list of jury profiles pending validation for more than 48 hours
    const pendingJuries = await db
      .select({
        firstName: juryProfiles.firstName,
        lastName: juryProfiles.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(
        and(
          eq(users.userType, 'jury'),
          eq(users.validationStatus, 'pending'),
          sql`${users.createdAt} < NOW() - INTERVAL '48 hours'`
        )
      )
      .orderBy(users.createdAt);

    return NextResponse.json({
      success: true,
      data: pendingJuries,
    });
  } catch (error) {
    console.error('Error fetching pending validations details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending validations details' },
      { status: 500 }
    );
  }
}
