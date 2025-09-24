'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, AlertTriangle, TrendingUp, FileText, Settings, Activity, Shield, Info, X, Calendar, MapPin, Video, User, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper function to get status display info
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'En attente', color: '#f59e0b', bgColor: '#fef3c7' },
    accepted: { label: 'Acceptées', color: '#10b981', bgColor: '#d1fae5' },
    in_progress: { label: 'En cours', color: '#3b82f6', bgColor: '#dbeafe' },
    completed: { label: 'Terminées', color: '#059669', bgColor: '#a7f3d0' },
    cancelled: { label: 'Annulées', color: '#ef4444', bgColor: '#fecaca' },
  };
  return statusMap[status] || { label: status, color: '#6b7280', bgColor: '#f3f4f6' };
};

// Helper function to format session modality
const getModalityInfo = (modality: string | null) => {
  if (modality === 'presentiel') {
    return { label: 'Présentiel', icon: MapPin };
  } else if (modality === 'visioconference') {
    return { label: 'Visioconférence', icon: Video };
  }
  return { label: 'Non spécifié', icon: User };
};

interface PendingValidationsResponse {
  success: boolean;
  count: number;
}

interface PendingJury {
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface PendingValidationsDetailsResponse {
  success: boolean;
  data: PendingJury[];
}

interface DashboardKPIs {
  totalUsers: number;
  pendingProfiles: number;
  totalConnections: number;
  averageJuryRating: number | null;
}

interface DashboardKPIsResponse {
  success: boolean;
  data: DashboardKPIs;
}

interface SessionCompletionStats {
  totalSessions: number;
  completedSessions: number;
  incompleteSessions: number;
  completionPercentage: number;
}

interface SessionCompletionStatsResponse {
  success: boolean;
  data: SessionCompletionStats;
}

interface UserTypeDistribution {
  totalUsers: number;
  centreCount: number;
  juryCount: number;
  centrePercentage: number;
  juryPercentage: number;
}

interface UserTypeDistributionResponse {
  success: boolean;
  data: UserTypeDistribution;
}

interface SessionStatusItem {
  status: string;
  count: number;
  percentage: number;
}

interface SessionStatusBreakdown {
  totalSessions: number;
  statusBreakdown: SessionStatusItem[];
}

interface SessionStatusBreakdownResponse {
  success: boolean;
  data: SessionStatusBreakdown;
}

interface SessionDetail {
  id: number;
  status: string;
  sessionDate: string | null;
  sessionModality: string | null;
  createdAt: string;
  certificationTitle: string | null;
  sessionLocation: string | null;
  daysUntilSession: number | null;
  centre: {
    name: string | null;
    city: string | null;
  };
  jury: {
    firstName: string | null;
    lastName: string | null;
    city: string | null;
  };
}

interface DetailedSessionInfo {
  id: number;
  status: string;
  sessionDate: string | null;
  sessionModality: string | null;
  createdAt: string;
  certificationTitle: string | null;
  certificationCode: string | null;
  sessionLocation: string | null;
  candidateCount: number | null;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  transportCovered: boolean | null;
  mealsCovered: boolean | null;
  accommodationCovered: boolean | null;
  customMessage: string | null;
  centre: {
    name: string | null;
    city: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    userEmail: string | null;
  };
  jury: {
    firstName: string | null;
    lastName: string | null;
    region: string | null;
    position: string | null;
    experience: number | null;
    expertise: string[] | null;
    email: string | null;
  };
}

interface SessionDetailsResponse {
  success: boolean;
  data: {
    status: string;
    sessions: SessionDetail[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      actualCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      isLimited: boolean;
    };
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [sessionDetails, setSessionDetails] = useState<Record<number, DetailedSessionInfo>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Handle info icon click for status details
  const handleStatusInfoClick = (status: string) => {
    setSelectedStatus(status);
    setShowStatusModal(true);
    setCurrentPage(1); // Reset to first page when opening modal
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedSessionId(null); // Close any expanded session when changing page
  };

  // Helper function to get time-based tag
  const getTimeTag = (daysUntilSession: number | null) => {
    if (daysUntilSession === null) {
      return { label: 'Date non définie', color: 'bg-gray-100 text-gray-600' };
    }
    if (daysUntilSession === -1) {
      return { label: 'Date de session passée', color: 'bg-red-100 text-red-700' };
    }
    if (daysUntilSession === 0) {
      return { label: "Aujourd'hui", color: 'bg-green-100 text-green-700' };
    }
    if (daysUntilSession === 1) {
      return { label: 'Demain', color: 'bg-blue-100 text-blue-700' };
    }
    return { 
      label: `Dans ${daysUntilSession} jours`, 
      color: 'bg-blue-100 text-blue-700' 
    };
  };

  // Handle session row click (expand/collapse)
  const handleSessionClick = async (sessionId: number) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }

    setExpandedSessionId(sessionId);

    // Lazy load detailed session info if not already loaded
    if (!sessionDetails[sessionId]) {
      try {
        const response = await fetch(`/api/admin/session-details/${sessionId}`);
        const result = await response.json();
        if (result.success) {
          setSessionDetails(prev => ({
            ...prev,
            [sessionId]: result.data
          }));
        }
      } catch (error) {
        console.error('Error loading session details:', error);
      }
    }
  };
  
  // Fetch pending validations data
  const { data: pendingValidations, error: pendingError } = useSWR<PendingValidationsResponse>(
    isAuthorized ? '/api/admin/pending-validations' : null,
    fetcher
  );

  // Fetch detailed pending validations data for tooltip
  const { data: pendingValidationsDetails } = useSWR<PendingValidationsDetailsResponse>(
    isAuthorized && showTooltip && pendingValidations?.count && pendingValidations.count > 0 
      ? '/api/admin/pending-validations-details' 
      : null,
    fetcher
  );

  // Fetch dashboard KPIs
  const { data: dashboardKPIs } = useSWR<DashboardKPIsResponse>(
    isAuthorized ? '/api/admin/dashboard-kpis' : null,
    fetcher
  );

  // Fetch session completion stats
  const { data: sessionStats } = useSWR<SessionCompletionStatsResponse>(
    isAuthorized ? '/api/admin/session-completion-stats' : null,
    fetcher
  );

  // Fetch user type distribution
  const { data: userTypeStats } = useSWR<UserTypeDistributionResponse>(
    isAuthorized ? '/api/admin/user-type-distribution' : null,
    fetcher
  );

  // Fetch session status breakdown
  const { data: sessionStatusStats } = useSWR<SessionStatusBreakdownResponse>(
    isAuthorized ? '/api/admin/session-status-breakdown' : null,
    fetcher
  );

  // Fetch session details for selected status
  const { data: sessionsList } = useSWR<SessionDetailsResponse>(
    isAuthorized && selectedStatus ? `/api/admin/session-details?status=${selectedStatus}&page=${currentPage}` : null,
    fetcher
  );

  useEffect(() => {
    if (userLoading) return;
    
    if (userError || !user) {
      router.push('/sign-in');
      return;
    }

    if (user.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, userError, userLoading, router]);

  // Show loading state while checking authorization
  if (userLoading || !isAuthorized) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-600 mb-2">
              Vérification des autorisations...
            </div>
            <div className="text-sm text-gray-500">
              Veuillez patienter pendant que nous vérifions vos droits d'accès.
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Tableau de bord Administration</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme SimplyJury</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <FileText className="w-4 h-4" />
          Export rapport
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]">
          <Settings className="w-4 h-4" />
          Centre d'aide
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4 mb-8">
        {/* Action requise - Only show if there are pending validations */}
        {pendingValidations?.success && pendingValidations.count > 0 && (
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 relative cursor-pointer hover:bg-red-100 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Action requise</h3>
            </div>
            <p className="text-red-700 text-sm">
              {pendingValidations.count} profil{pendingValidations.count > 1 ? 's' : ''} jury{pendingValidations.count > 1 ? 's' : ''} en attente de validation depuis plus de 48h
            </p>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Jurys en attente de validation</h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {pendingValidationsDetails?.success && pendingValidationsDetails.data ? (
                    <div className="space-y-2">
                      {pendingValidationsDetails.data.map((jury, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium text-gray-900">
                            {jury.firstName} {jury.lastName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(jury.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Chargement des détails...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Pic d'activité détecté</h3>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Fonctionnalité V2
            </span>
          </div>
          <p className="text-yellow-700 text-sm">+45% d'inscriptions cette semaine. Vérifiez les capacités serveur.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-amber-700 font-medium">
              Données simulées - Cette fonctionnalité sera disponible dans la version 2.0
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardKPIs?.success ? dashboardKPIs.data.totalUsers.toLocaleString() : '...'}
          </div>
          <div className="text-sm text-gray-600">Utilisateurs totaux</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardKPIs?.success ? dashboardKPIs.data.pendingProfiles : '...'}
          </div>
          <div className="text-sm text-gray-600 mb-2">Profils en attente</div>
          <div className="text-xs text-red-600">
            {dashboardKPIs?.success && dashboardKPIs.data.pendingProfiles > 0 ? 'Action requise' : 'Aucune action'}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardKPIs?.success ? dashboardKPIs.data.totalConnections.toLocaleString() : '...'}
          </div>
          <div className="text-sm text-gray-600">Mises en relation</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardKPIs?.success ? 
              (dashboardKPIs.data.averageJuryRating !== null ? 
                dashboardKPIs.data.averageJuryRating : 'N/A') 
              : '...'}
          </div>
          <div className="text-sm text-gray-600 mb-2">Note moyenne jury</div>
          <div className="text-xs text-gray-500">
            {dashboardKPIs?.success && dashboardKPIs.data.averageJuryRating !== null ? 'Stable' : 'Aucune note'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Completion Chart */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Taux de finalisation des sessions</h3>
              <div className="text-sm text-gray-600">
                {sessionStats?.success ? `${sessionStats.data.totalSessions} sessions totales` : '...'}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {sessionStats?.success ? (
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Ring Chart */}
                  <svg width="200" height="200" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    {/* Completed sessions arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${(sessionStats.data.completionPercentage / 100) * 502.65} 502.65`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {sessionStats.data.completionPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">Finalisées</div>
                  </div>
                </div>
                
                {/* Legend and stats */}
                <div className="ml-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#10b981'}}></div>
                    <div>
                      <div className="font-medium text-gray-900">Sessions finalisées</div>
                      <div className="text-sm text-gray-600">{sessionStats.data.completedSessions} sessions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">Sessions non finalisées</div>
                      <div className="text-sm text-gray-600">{sessionStats.data.incompleteSessions} sessions</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Les sessions finalisées permettent aux centres et jurys de s'évaluer mutuellement.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement des statistiques...</div>
              </div>
            )}
          </div>
        </div>

        {/* User Type Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Répartition des utilisateurs</h3>
              <div className="text-sm text-gray-600">
                {userTypeStats?.success ? `${userTypeStats.data.totalUsers} utilisateurs` : '...'}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {userTypeStats?.success ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Ring Chart */}
                  <svg width="160" height="160" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="16"
                    />
                    {/* Centre users arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="16"
                      strokeDasharray={`${(userTypeStats.data.centrePercentage / 100) * 377} 377`}
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Jury users arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="16"
                      strokeDasharray={`${(userTypeStats.data.juryPercentage / 100) * 377} 377`}
                      strokeDashoffset={`-${(userTypeStats.data.centrePercentage / 100) * 377}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userTypeStats.data.totalUsers}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
                
                {/* Legend and stats */}
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#0ea5e9'}}></div>
                      <span className="text-sm font-medium text-gray-900">Centres</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{userTypeStats.data.centreCount}</div>
                      <div className="text-xs text-gray-600">{userTypeStats.data.centrePercentage}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#f97316'}}></div>
                      <span className="text-sm font-medium text-gray-900">Jurys</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{userTypeStats.data.juryCount}</div>
                      <div className="text-xs text-gray-600">{userTypeStats.data.juryPercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement...</div>
              </div>
            )}
          </div>
        </div>

        {/* Session Status Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0d4a70]">État des sessions</h3>
              <div className="text-sm text-gray-600">
                {sessionStatusStats?.success ? `${sessionStatusStats.data.totalSessions} sessions` : '...'}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {sessionStatusStats?.success ? (
              <div className="space-y-4">
                {sessionStatusStats.data.statusBreakdown.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  const maxCount = Math.max(...sessionStatusStats.data.statusBreakdown.map(s => s.count));
                  const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{statusInfo.label}</span>
                          <button
                            onClick={() => handleStatusInfoClick(item.status)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            title={`Voir les détails pour ${statusInfo.label}`}
                          >
                            <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.count}</span>
                          <span className="text-xs text-gray-500">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: statusInfo.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {sessionStatusStats.data.totalSessions === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune session enregistrée</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#0d4a70]">
                Sessions {getStatusInfo(selectedStatus).label}
              </h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {sessionsList?.success ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {sessionsList.data.pagination.isLimited ? (
                        <>
                          Affichage de {sessionsList.data.sessions.length} sessions sur {sessionsList.data.pagination.totalCount} 
                          (limité aux {sessionsList.data.pagination.totalCount} plus récentes)
                        </>
                      ) : (
                        <>
                          {sessionsList.data.sessions.length} session(s) trouvée(s)
                        </>
                      )}
                    </div>
                    
                    {/* Pagination Controls */}
                    {sessionsList.data.pagination.totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!sessionsList.data.pagination.hasPrevPage}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: sessionsList.data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-2 py-1 text-sm rounded ${
                                page === currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!sessionsList.data.pagination.hasNextPage}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {sessionsList.data.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessionsList.data.sessions.map((session) => {
                        const timeTag = getTimeTag(session.daysUntilSession);
                        const modalityInfo = getModalityInfo(session.sessionModality);
                        const isExpanded = expandedSessionId === session.id;
                        const detailedInfo = sessionDetails[session.id];
                        
                        return (
                          <div key={session.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Collapsed Row - Always Visible */}
                            <div 
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleSessionClick(session.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Expand/Collapse Icon */}
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  
                                  {/* Session Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-900 truncate">
                                        #{session.id} - {session.certificationTitle || 'Certification non spécifiée'}
                                      </span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${timeTag.color}`}>
                                        {timeTag.label}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-4">
                                      <span className="truncate">
                                        {session.centre.name || 'Centre non spécifié'}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="truncate">
                                        {session.jury.firstName && session.jury.lastName 
                                          ? `${session.jury.firstName} ${session.jury.lastName}`
                                          : 'Jury non spécifié'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Quick Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {session.sessionDate && (
                                    <span>{formatDate(session.sessionDate)}</span>
                                  )}
                                  {modalityInfo.icon && (
                                    <modalityInfo.icon className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Details - Lazy Loaded */}
                            {isExpanded && (
                              <div className="border-t border-gray-200 bg-gray-50 p-4">
                                {detailedInfo ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Centre Details */}
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        Centre de formation
                                      </h4>
                                      <div className="pl-6 space-y-2 text-sm">
                                        <div className="font-medium">{detailedInfo.centre.name || 'Non spécifié'}</div>
                                        <div className="text-gray-600">{detailedInfo.centre.city || 'Ville non spécifiée'}</div>
                                        <div className="text-gray-600">{detailedInfo.centre.email || 'Email non spécifié'}</div>
                                        {detailedInfo.centre.phone && (
                                          <div className="text-gray-600">{detailedInfo.centre.phone}</div>
                                        )}
                                        {detailedInfo.centre.address && (
                                          <div className="text-gray-600">{detailedInfo.centre.address}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Jury Details */}
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-600" />
                                        Jury
                                      </h4>
                                      <div className="pl-6 space-y-2 text-sm">
                                        <div className="font-medium">
                                          {detailedInfo.jury.firstName && detailedInfo.jury.lastName 
                                            ? `${detailedInfo.jury.firstName} ${detailedInfo.jury.lastName}`
                                            : 'Non spécifié'
                                          }
                                        </div>
                                        <div className="text-gray-600">{detailedInfo.jury.region || 'Région non spécifiée'}</div>
                                        <div className="text-gray-600">{detailedInfo.jury.email || 'Email non spécifié'}</div>
                                        {detailedInfo.jury.position && (
                                          <div className="text-gray-600">{detailedInfo.jury.position}</div>
                                        )}
                                        {detailedInfo.jury.experience && (
                                          <div className="text-gray-600">{detailedInfo.jury.experience} ans d'expérience</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Session Details */}
                                    <div className="md:col-span-2 space-y-3">
                                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                        Détails de la session
                                      </h4>
                                      <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                          {detailedInfo.certificationCode && (
                                            <div><span className="font-medium">Code:</span> {detailedInfo.certificationCode}</div>
                                          )}
                                          {detailedInfo.candidateCount && (
                                            <div><span className="font-medium">Candidats:</span> {detailedInfo.candidateCount}</div>
                                          )}
                                          {detailedInfo.sessionStartTime && (
                                            <div><span className="font-medium">Heure début:</span> {detailedInfo.sessionStartTime}</div>
                                          )}
                                          {detailedInfo.sessionEndTime && (
                                            <div><span className="font-medium">Heure fin:</span> {detailedInfo.sessionEndTime}</div>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          {detailedInfo.sessionLocation && (
                                            <div><span className="font-medium">Lieu:</span> {detailedInfo.sessionLocation}</div>
                                          )}
                                          <div><span className="font-medium">Transport:</span> {detailedInfo.transportCovered ? 'Pris en charge' : 'Non pris en charge'}</div>
                                          <div><span className="font-medium">Repas:</span> {detailedInfo.mealsCovered ? 'Pris en charge' : 'Non pris en charge'}</div>
                                          <div><span className="font-medium">Hébergement:</span> {detailedInfo.accommodationCovered ? 'Pris en charge' : 'Non pris en charge'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="text-gray-500 text-sm">Chargement des détails...</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucune session trouvée pour ce statut</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Chargement des sessions...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
