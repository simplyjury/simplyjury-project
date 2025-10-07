import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles, trainingCenters } from '@/lib/db/schema';
import { count, desc, asc, ilike, or, eq, isNull, isNotNull, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions: any[] = [];

    // Search by name or email
    if (search) {
      whereConditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    // Filter by user type
    if (userType && userType !== '') {
      whereConditions.push(eq(users.userType, userType));
    }

    // Filter by status
    if (status === 'active') {
      // Active users: not deleted and validated
      whereConditions.push(isNull(users.deletedAt));
      whereConditions.push(eq(users.validationStatus, 'validated'));
    } else if (status === 'pending') {
      whereConditions.push(isNull(users.deletedAt));
      whereConditions.push(eq(users.validationStatus, 'pending'));
    } else if (status === 'suspended') {
      // Suspended users have deletedAt set (not null)
      whereConditions.push(isNotNull(users.deletedAt));
    }
    // Default: show all users (both active and deactivated)

    // Build final WHERE clause
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const totalCount = totalCountResult[0].count;

    // Determine sort order
    let orderByClause;
    if (sortBy === 'name') {
      orderByClause = sortOrder === 'asc' ? asc(users.name) : desc(users.name);
    } else if (sortBy === 'userType') {
      orderByClause = sortOrder === 'asc' ? asc(users.userType) : desc(users.userType);
    } else if (sortBy === 'validationStatus') {
      orderByClause = sortOrder === 'asc' ? asc(users.validationStatus) : desc(users.validationStatus);
    } else if (sortBy === 'lastLogin') {
      orderByClause = sortOrder === 'asc' ? asc(users.lastLogin) : desc(users.lastLogin);
    } else {
      // Default sort by creation date descending
      orderByClause = desc(users.createdAt);
    }

    // Get paginated users with profile photos
    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        validationStatus: users.validationStatus,
        lastLogin: users.lastLogin,
        emailVerified: users.emailVerified,
        profileCompleted: users.profileCompleted,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        juryPhotoUrl: juryProfiles.profilePhotoUrl,
        centerLogoUrl: trainingCenters.logoUrl,
      })
      .from(users)
      .leftJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .leftJoin(trainingCenters, eq(users.id, trainingCenters.userId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users: usersList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
