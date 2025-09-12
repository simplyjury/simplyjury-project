import SearchPageClient from './search-client';

export default async function SearchPage() {
  // No authentication required - accessible to all users
  console.log('🔍 SearchPage: COMPONENT RENDERED - No auth protection, accessible to all');
  
  return <SearchPageClient />;
}
