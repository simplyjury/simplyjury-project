'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Suspense, useEffect } from 'react';
import JuryDashboard from '@/components/dashboard/jury-dashboard';
import CenterDashboard from '@/components/dashboard/center-dashboard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profile = searchParams.get('profile');
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.userType === 'admin') {
      router.replace('/dashboard/admin');
    }
  }, [user, router]);
  
  // Don't render anything for admin users while redirecting
  if (user?.userType === 'admin') {
    return <div className="flex items-center justify-center h-64">Redirection...</div>;
  }
  
  // Determine if user is jury based on URL parameter, profile data, or user.userType
  const isJury = profile === 'jury' || 
                 (juryProfile?.data && !profile) || 
                 (user?.userType === 'jury' && !profile);
  
  if (isJury) {
    return <JuryDashboard />;
  }
  
  return <CenterDashboard />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Chargement...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
