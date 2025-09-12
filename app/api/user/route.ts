import { getUser } from '@/lib/db/queries';

export async function GET() {
  console.log('🔍 /api/user: Starting user fetch - PRODUCTION DEBUG');
  
  try {
    const user = await getUser();
    console.log('✅ /api/user: User fetched successfully:', { 
      userId: user?.id, 
      userType: user?.userType,
      email: user?.email?.substring(0, 10) + '...',
      hasUser: !!user
    });
    return Response.json(user);
  } catch (error) {
    console.error('❌ /api/user: Error fetching user:', error);
    return Response.json(null, { status: 500 });
  }
}
