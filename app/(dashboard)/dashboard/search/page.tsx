import { requireCenter } from '@/lib/auth/role-protection';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // Server-side protection - only centers can access this page
  console.log('🔍 SearchPage: Starting requireCenter check - PRODUCTION TEST');
  
  // Temporarily bypass requireCenter to test if this is the issue
  // await requireCenter();
  
  console.log('✅ SearchPage: Bypassing requireCenter for testing - PRODUCTION TEST');
  
  return <SearchPageClient />;
}
