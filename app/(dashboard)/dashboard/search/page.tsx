import { requireCenter } from '@/lib/auth/role-protection';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // Server-side protection - only centers can access this page
  console.log('🔍 SearchPage: COMPONENT RENDERED - Starting server-side auth check');
  
  try {
    console.log('🔍 SearchPage: About to call requireCenter()');
    const user = await requireCenter();
    console.log('✅ SearchPage: requireCenter passed for user:', { 
      id: user.id, 
      userType: user.userType 
    });
  } catch (error) {
    console.error('❌ SearchPage: requireCenter failed:', error);
    console.error('❌ SearchPage: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error; // This will cause redirect to sign-in
  }
  
  return <SearchPageClient />;
}
