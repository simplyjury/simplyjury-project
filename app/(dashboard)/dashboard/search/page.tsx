import { requireCenter } from '@/lib/auth/role-protection';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // Server-side protection - only centers can access this page
  console.log('🔍 SearchPage: Starting server-side auth check - PRODUCTION DEBUG');
  
  try {
    await requireCenter();
    console.log('✅ SearchPage: requireCenter passed - user authorized');
  } catch (error) {
    console.error('❌ SearchPage: requireCenter failed:', error);
    throw error; // This will cause redirect to sign-in
  }
  
  return <SearchPageClient />;
}
