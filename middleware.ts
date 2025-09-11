// lib/auth/server-auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/session';

export async function requireAuth() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/sign-in');
  }

  try {
    const sessionData = await verifyToken(sessionCookie.value);
    
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      redirect('/sign-in');
    }

    return sessionData;
  } catch (error) {
    redirect('/sign-in');
  }
}

// Usage in page components (app/dashboard/search/page.tsx)
import { requireAuth } from '@/lib/auth/server-auth';

export default async function SearchPage() {
  const user = await requireAuth(); // This will redirect if not authenticated
  
  return (
    <div>
      <h1>Search Dashboard</h1>
      <p>Welcome, {user.email}</p>
      {/* Your search component */}
    </div>
  );
}
