import { requireCenter } from '@/lib/auth/role-protection';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // Server-side protection - only centers can access this page
  console.log('🔍 SearchPage: Starting requireCenter check - PRODUCTION TEST');
  try {
    await requireCenter();
    console.log('✅ SearchPage: requireCenter passed - PRODUCTION TEST');
  } catch (error) {
    console.error('❌ SearchPage: requireCenter failed - PRODUCTION TEST:', error);
    throw error;
  }
  
  return <SearchPageClient />;
}
