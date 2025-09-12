import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  console.log('🔍 getUser: Starting authentication check - PRODUCTION DEBUG');
  
  const cookieStore = await cookies();
  
  // Handle production cookie name changes (same as middleware)
  let sessionCookie = cookieStore.get('session');
  if (!sessionCookie && process.env.NODE_ENV === 'production') {
    sessionCookie = cookieStore.get('__Secure-session') || 
                   cookieStore.get('__Host-session');
  }
  
  console.log('🔍 getUser: Session cookie check:', { 
    hasCookie: !!sessionCookie, 
    cookieLength: sessionCookie?.value?.length,
    cookieName: sessionCookie?.name,
    allCookies: Array.from(cookieStore.getAll()).map(c => c.name),
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!sessionCookie || !sessionCookie.value) {
    console.log('❌ getUser: No session cookie found');
    return null;
  }

  try {
    console.log('🔍 getUser: Attempting JWT verification...');
    // Use same verifyToken as middleware for consistency
    const sessionData = await verifyToken(sessionCookie.value);
    console.log('✅ getUser: JWT verification successful:', { 
      userId: sessionData?.userId, 
      userType: sessionData?.userType,
      hasExpiration: !!sessionData?.expires 
    });
    
    if (!sessionData || !sessionData.userId || typeof sessionData.userId !== 'number') {
      console.log('❌ getUser: Invalid session data structure');
      return null;
    }

    console.log('🔍 getUser: Querying database for user ID:', sessionData.userId);
    
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.userId), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      console.log('❌ getUser: User not found in database');
      return null;
    }

    console.log('✅ getUser: User found in database:', { 
      userId: user[0].id, 
      userType: user[0].userType,
      email: user[0].email?.substring(0, 10) + '...'
    });
    return user[0];
  } catch (error) {
    console.error('❌ getUser: JWT verification failed:', error);
    return null;
  }
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}
