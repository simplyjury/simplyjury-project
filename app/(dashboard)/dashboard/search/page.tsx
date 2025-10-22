import SearchPageClient from './search-client';
import { getUser } from '@/lib/db/queries';

export default async function SearchPage() {
  const user = await getUser();
  
  return <SearchPageClient userType={user?.userType} />;
}
