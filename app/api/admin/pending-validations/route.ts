import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { sql, and, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get count of jury profiles pending validation for more than 48 hours
    const pendingValidations = await db
      .select({
        count: sql<number>`count(*)`.as('count'),
      })
      .from(users)
      .innerJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(
        and(
          eq(users.userType, 'jury'),
          eq(users.validationStatus, 'pending'),
          sql`${users.createdAt} < NOW() - INTERVAL '48 hours'`
        )
      );

    const count = pendingValidations[0]?.count || 0;

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching pending validations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending validations' },
      { status: 500 }
    );
  }
}
