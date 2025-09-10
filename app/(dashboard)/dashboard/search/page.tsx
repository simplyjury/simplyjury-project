import { requireCenter } from '@/lib/auth/role-protection';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // Server-side protection - only centers can access this page
  console.log('🔍 SearchPage: Starting requireCenter check');
  
  try {
    const user = await requireCenter();
    console.log('✅ SearchPage: requireCenter passed for user:', { 
      id: user.id, 
      userType: user.userType 
    });
  } catch (error) {
    console.error('❌ SearchPage: requireCenter failed:', error);
    // Let the error propagate to trigger the redirect
    throw error;
  }
  
  return <SearchPageClient />;
}
