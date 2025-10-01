'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  Users,
  FileText,
  Search
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CenterStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedSessions: number;
  contactedJuries: number;
  activeConversations: number;
  averageRatingGiven: number;
  totalRatingsGiven: number;
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
  const { data: requests, error: requestsError } = useSWR('/api/center/recent-requests', fetcher);
  
  // Show loading state
  if (!requests && !requestsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
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

  const recentRequests = requests?.data || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Demandes récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{request.certificationName}</p>
                  {request.certificationCode && (
                    <p className="text-xs text-gray-500 mb-1">Code: {request.certificationCode}</p>
                  )}
                  <p className="text-xs text-gray-600">{request.juryName}</p>
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
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune demande récente</p>
            <p className="text-sm text-gray-400">Les demandes envoyées dans les 10 derniers jours apparaîtront ici</p>
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
          <Link href="/dashboard/search">
            <Button variant="outline" className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              Rechercher un jury
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Consulter mes messages
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Mettre à jour mon profil
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CenterDashboard() {
  const { data: stats, error: statsError } = useSWR('/api/center/stats', fetcher);
  const { data: profile } = useSWR('/api/profile/center', fetcher);

  const centerStats: CenterStats = stats?.data || {
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    completedSessions: 0,
    contactedJuries: 0,
    activeConversations: 0,
    averageRatingGiven: 0,
    totalRatingsGiven: 0
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
    console.error('Error loading center stats:', statsError);
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
          Bonjour {profile?.data?.name || 'Centre'} ! 👋
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité sur SimplyJury
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Demandes envoyées"
          value={centerStats.totalRequests}
          icon={Send}
          trend={`${centerStats.totalRequests} au total`}
        />
        <StatsCard
          title="En attente"
          value={centerStats.pendingRequests}
          icon={Clock}
          color="text-orange-600"
          trend={centerStats.pendingRequests > 0 ? "En attente de réponse" : "Aucune demande en attente"}
        />
        <StatsCard
          title="Sessions réalisées"
          value={centerStats.completedSessions}
          icon={CheckCircle}
          color="text-green-600"
          trend={`${centerStats.completedSessions} session${centerStats.completedSessions > 1 ? 's' : ''} terminée${centerStats.completedSessions > 1 ? 's' : ''}`}
        />
        <StatsCard
          title="Jurys contactés"
          value={centerStats.contactedJuries}
          icon={Users}
          color="text-purple-600"
          trend={`${centerStats.activeConversations} conversation${centerStats.activeConversations > 1 ? 's' : ''} active${centerStats.activeConversations > 1 ? 's' : ''}`}
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
