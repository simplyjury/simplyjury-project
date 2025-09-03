'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Suspense } from 'react';
import JuryProfilePage from '@/components/profile/jury-profile-page';
import CenterProfilePage from '@/components/profile/center-profile-page';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ProfileContent() {
  const searchParams = useSearchParams();
  
  // Fetch user data to determine user type
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfileResponse } = useSWR('/api/profile/jury', fetcher);
  
  // Determine if user is jury using consistent detection logic from the document
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfileResponse?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));

  if (isJury) {
    return <JuryProfilePage />;
  }
  
  return <CenterProfilePage />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Chargement...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
