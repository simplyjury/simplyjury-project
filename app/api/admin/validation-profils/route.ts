import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles, trainingCenters } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin or validator
    if (authResult.user.userType !== 'admin' && !authResult.user.isValidator) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('type') || '';
    const region = searchParams.get('region') || '';

    // Base query to get pending jury users with their profiles
    const pendingUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        validationStatus: users.validationStatus,
        createdAt: users.createdAt,
        profileCompleted: users.profileCompleted,
        // Jury profile fields
        firstName: juryProfiles.firstName,
        lastName: juryProfiles.lastName,
        city: juryProfiles.city,
        region: juryProfiles.region,
        hourlyRate: juryProfiles.hourlyRate,
        profilePhotoUrl: juryProfiles.profilePhotoUrl,
        experienceYears: juryProfiles.experienceYears,
        currentPosition: juryProfiles.currentPosition,
        expertiseDomains: juryProfiles.expertiseDomains,
      })
      .from(users)
      .leftJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(
        and(
          eq(users.validationStatus, 'pending'),
          eq(users.profileCompleted, true),
          eq(users.userType, 'jury')
        )
      )
      .orderBy(users.createdAt);

    // Apply filters
    let filteredUsers = pendingUsers;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const fullName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.toLowerCase()
          : user.name?.toLowerCase() || '';
        const email = user.email.toLowerCase();
        const city = user.city?.toLowerCase() || '';
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               city.includes(searchLower);
      });
    }

    if (region) {
      filteredUsers = filteredUsers.filter(user => user.region === region);
    }

    // Calculate stats
    const stats = {
      pending: pendingUsers.length,
      validatedThisMonth: 0, // TODO: Calculate from database
      rejectedThisMonth: 0,  // TODO: Calculate from database
      urgent: pendingUsers.filter(user => {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursDiff > 48;
      }).length
    };

    // Format users for frontend
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.name,
      email: user.email,
      userType: user.userType,
      validationStatus: user.validationStatus,
      createdAt: user.createdAt,
      profilePhotoUrl: user.profilePhotoUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      region: user.region,
      hourlyRate: user.hourlyRate,
      experienceYears: user.experienceYears,
      currentPosition: user.currentPosition,
      expertiseDomains: user.expertiseDomains,
      // Calculate urgency
      isUrgent: (() => {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursDiff > 48;
      })(),
      // Calculate time since creation
      timeAgo: (() => {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) {
          return `Il y a ${Math.floor(hoursDiff * 60)}min`;
        } else if (hoursDiff < 24) {
          return `Il y a ${Math.floor(hoursDiff)}h`;
        } else {
          return `Il y a ${Math.floor(hoursDiff / 24)}j`;
        }
      })()
    }));

    return NextResponse.json({
      users: formattedUsers,
      stats
    });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des profils en attente' },
      { status: 500 }
    );
  }
}
