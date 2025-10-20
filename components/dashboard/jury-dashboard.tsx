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
import RejectionAlert from './rejection-alert';

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
  const { data: requestsData, error: requestsError } = useSWR('/api/jury/recent-requests', fetcher);
  
  // Show loading state
  if (!requestsData && !requestsError) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demandes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement des demandes...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (requestsError) {
    console.error('Error loading recent requests:', requestsError);
  }

  const recentRequests = requestsData?.data || [];
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Demandes récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{request.certificationName}</p>
                  {request.certificationCode && (
                    <p className="text-xs text-gray-500 mb-1">Code: {request.certificationCode}</p>
                  )}
                  <p className="text-xs text-gray-600">{request.centerName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{request.date}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{request.candidateCount} candidat{request.candidateCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'declined' ? 'bg-red-100 text-red-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'accepted' ? 'Acceptée' :
                     request.status === 'declined' ? 'Refusée' :
                     request.status === 'completed' ? 'Terminée' : request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {request.modality === 'presentiel' ? 'Présentiel' :
                     request.modality === 'visio' ? 'Visio' :
                     request.modality === 'hybride' ? 'Hybride' : request.modality}
                  </p>
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
            <p className="text-sm text-gray-400">Les demandes reçues dans les 10 derniers jours apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function QuickActions() {
  const { data: unreadData } = useSWR('/api/unread-conversations-count', fetcher);
  const unreadCount = unreadData?.unreadConversationsCount || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 gap-3">
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mettre à jour mon profil
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="w-full justify-start relative">
              <MessageSquare className="mr-2 h-4 w-4" />
              Consulter mes messages
              {unreadCount > 0 && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-orange-600">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                </span>
              )}
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
  const { data: stats, error: statsError } = useSWR('/api/jury/stats', fetcher);
  const { data: profile } = useSWR('/api/profile/jury', fetcher);
  const { data: user } = useSWR('/api/user', fetcher);

  const juryStats: JuryStats = stats?.data || {
    totalRequests: 0,
    pendingRequests: 0,
    completedMissions: 0,
    averageRating: 0,
    totalEarnings: 0
  };

  // Show loading state while fetching stats
  if (!stats && !statsError) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des statistiques...</div>
        </div>
      </section>
    );
  }

  // Show error state if stats failed to load
  if (statsError) {
    console.error('Error loading jury stats:', statsError);
  }

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

      {/* Rejection Alert */}
      {user?.validationStatus === 'rejected' && (
        <RejectionAlert rejectionReason={user?.validationComment} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Demandes reçues"
          value={juryStats.totalRequests}
          icon={FileText}
          trend={`${juryStats.totalRequests} au total`}
        />
        <StatsCard
          title="En attente"
          value={juryStats.pendingRequests}
          icon={Clock}
          color="text-orange-600"
          trend={juryStats.pendingRequests > 0 ? "Nécessite une réponse" : "Aucune demande en attente"}
        />
        <StatsCard
          title="Missions réalisées"
          value={juryStats.completedMissions}
          icon={CheckCircle}
          color="text-green-600"
          trend={`${juryStats.completedMissions} mission${juryStats.completedMissions > 1 ? 's' : ''} terminée${juryStats.completedMissions > 1 ? 's' : ''}`}
        />
        <StatsCard
          title="Note moyenne"
          value={juryStats.averageRating > 0 ? `${juryStats.averageRating}/5` : '-'}
          icon={Star}
          color="text-yellow-600"
          trend={juryStats.averageRating > 0 ? `Basée sur ${(stats?.data?.totalRatings || 0)} évaluation${(stats?.data?.totalRatings || 0) > 1 ? 's' : ''}` : 'Aucune évaluation'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RecentRequests />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </section>
  );
}
