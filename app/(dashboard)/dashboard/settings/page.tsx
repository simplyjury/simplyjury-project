'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Suspense } from 'react';
import JurySettings from '@/components/dashboard/jury-settings';
import CenterSettings from '@/components/dashboard/center-settings';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SettingsContent() {
  const searchParams = useSearchParams();
  
  // Fetch user data to determine user type
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfileResponse } = useSWR('/api/profile/jury', fetcher);
  
  // Determine if user is jury using consistent detection logic
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfileResponse?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));

  if (isJury) {
    return <JurySettings />;
  }
  
  return <CenterSettings />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Chargement...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
