'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import JuryDashboard from '@/components/dashboard/jury-dashboard';
import CenterDashboard from '@/components/dashboard/center-dashboard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const profile = searchParams.get('profile');
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  // Determine if user is jury based on URL parameter, profile data, or user.userType
  const isJury = profile === 'jury' || 
                 (juryProfile?.data && !profile) || 
                 (user?.userType === 'jury' && !profile);
  
  if (isJury) {
    return <JuryDashboard />;
  }
  
  return <CenterDashboard />;
}
