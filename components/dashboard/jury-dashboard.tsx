'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  Star, 
  CheckCircle,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JuryStats {
  totalRequests: number;
  pendingRequests: number;
  completedMissions: number;
  averageRating: number;
  totalEarnings: number;
}

function StatsCard({ title, value, icon: Icon, trend, color = "text-[#0d4a70]" }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function RecentRequests() {
  const { data: requests } = useSWR('/api/jury/requests', fetcher);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Demandes récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests?.data?.length > 0 ? (
          <div className="space-y-4">
            {requests.data.slice(0, 3).map((request: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{request.certificationName}</p>
                  <p className="text-xs text-gray-600">{request.centerName}</p>
                  <p className="text-xs text-gray-500">{request.date}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'accepted' ? 'Acceptée' : 'Terminée'}
                  </span>
                </div>
              </div>
            ))}
            <Link href="/dashboard/requests">
              <Button variant="outline" className="w-full">
                Voir toutes les demandes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune demande récente</p>
            <p className="text-sm text-gray-400">Les nouvelles demandes apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingMissions() {
  const { data: missions } = useSWR('/api/jury/missions/upcoming', fetcher);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Prochaines missions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {missions?.data?.length > 0 ? (
          <div className="space-y-4">
            {missions.data.slice(0, 3).map((mission: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{mission.certificationName}</p>
                  <p className="text-xs text-gray-600">{mission.centerName}</p>
                  <p className="text-xs text-blue-600 font-medium">{mission.date} à {mission.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#0d4a70]">{mission.modality}</p>
                  <p className="text-xs text-gray-500">{mission.duration}</p>
                </div>
              </div>
            ))}
            <Link href="/dashboard/missions">
              <Button variant="outline" className="w-full">
                Voir toutes les missions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune mission programmée</p>
            <p className="text-sm text-gray-400">Vos prochaines missions apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mettre à jour mon profil
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Consulter mes messages
            </Button>
          </Link>
          <Link href="/dashboard/evaluations">
            <Button variant="outline" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Voir mes évaluations
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JuryDashboard() {
  const { data: stats } = useSWR('/api/jury/stats', fetcher);
  const { data: profile } = useSWR('/api/profile/jury', fetcher);

  const juryStats: JuryStats = stats?.data || {
    totalRequests: 0,
    pendingRequests: 0,
    completedMissions: 0,
    averageRating: 0,
    totalEarnings: 0
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
          Bonjour {profile?.data?.firstName || 'Jury'} ! 👋
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité sur SimplyJury
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Demandes reçues"
          value={juryStats.totalRequests}
          icon={FileText}
          trend="+2 cette semaine"
        />
        <StatsCard
          title="En attente"
          value={juryStats.pendingRequests}
          icon={Clock}
          color="text-orange-600"
        />
        <StatsCard
          title="Missions réalisées"
          value={juryStats.completedMissions}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatsCard
          title="Note moyenne"
          value={juryStats.averageRating > 0 ? `${juryStats.averageRating}/5` : '-'}
          icon={Star}
          color="text-yellow-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentRequests />
          <UpcomingMissions />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </section>
  );
}
