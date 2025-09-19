'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Calendar, Clock, CheckCircle, XCircle, FileText, MapPin, Users, Eye, Award, Star, Building2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RatingModal from '@/components/ratings/rating-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Center Avatar Component with fallback to initials
interface CenterAvatarProps {
  centerName?: string | null;
}

function CenterAvatar({ centerName }: CenterAvatarProps) {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'CF';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
      {getInitials(centerName)}
    </div>
  );
}

interface Mission {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  certification_title: string;
  certification_code?: string;
  session_date: string;
  session_start_time?: string;
  session_end_time?: string;
  candidate_count: number;
  modality: 'presentiel' | 'visio' | 'hybride';
  session_location?: string;
  transport_covered: boolean;
  meals_covered: boolean;
  accommodation_covered: boolean;
  custom_message?: string;
  jury_response?: string;
  created_at: string;
  center_id: number;
  center_name: string;
  center_contact_name?: string;
  center_city?: string;
  center_region?: string;
  center_user_id: number;
}

interface MissionStats {
  total: number;
  completed: number;
  accepted: number;
  rejected: number;
}

// Jury missions component
function JuryMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats>({ total: 0, completed: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [certificationFilter, setCertificationFilter] = useState<string>('');
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    mission: Mission | null;
    centerId: number | null;
  }>({ isOpen: false, mission: null, centerId: null });
  const [missionRatings, setMissionRatings] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchJuryMissions();
  }, []);

  const fetchJuryMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jury-missions`);
      const result = await response.json();
      
      if (result.success) {
        setMissions(result.data || []);
        calculateStats(result.data || []);
        // Check which missions have been rated
        checkMissionRatings(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des missions');
      console.error('Error fetching jury missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkMissionRatings = async (missionsData: Mission[]) => {
    try {
      const ratingsStatus: Record<number, boolean> = {};
      
      // Check each mission for existing ratings
      for (const mission of missionsData) {
        const response = await fetch(`/api/session-ratings?jury_request_id=${mission.id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Check if jury has already rated this mission
          const juryRating = result.data.find((rating: any) => rating.rater_type === 'jury');
          ratingsStatus[mission.id] = !!juryRating;
        }
      }
      
      setMissionRatings(ratingsStatus);
    } catch (error) {
      console.error('Error checking mission ratings:', error);
    }
  };

  const handleOpenRatingModal = (mission: Mission) => {
    setRatingModal({
      isOpen: true,
      mission,
      centerId: mission.center_user_id
    });
  };

  const handleSubmitRating = async (ratingData: any) => {
    try {
      const response = await fetch('/api/session-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const result = await response.json();

      if (result.success) {
        // Update the ratings status
        setMissionRatings(prev => ({
          ...prev,
          [ratingData.jury_request_id]: true
        }));
        
        // Show success message
        alert('Évaluation envoyée avec succès!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const closeRatingModal = () => {
    setRatingModal({ isOpen: false, mission: null, centerId: null });
  };

  const calculateStats = (missionsData: Mission[]) => {
    const stats = missionsData.reduce((acc, mission) => {
      acc.total++;
      switch (mission.status) {
        case 'completed':
          acc.completed++;
          break;
        case 'accepted':
          acc.accepted++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
      }
      return acc;
    }, { total: 0, completed: 0, accepted: 0, rejected: 0 });
    
    setStats(stats);
  };

  // Client-side filtering logic
  const filteredMissions = missions.filter(mission => {
    // Apply status filter
    const matchesStatus = !statusFilter || mission.status === statusFilter;
    
    // Apply period filter
    let matchesPeriod = true;
    if (periodFilter) {
      const missionDate = new Date(mission.session_date);
      const now = new Date();
      
      switch (periodFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesPeriod = missionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesPeriod = missionDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesPeriod = missionDate >= quarterAgo;
          break;
      }
    }
    
    // Apply certification filter
    const matchesCertification = !certificationFilter || 
      (mission.certification_title && mission.certification_title.toLowerCase().includes(certificationFilter.toLowerCase()));
    
    return matchesStatus && matchesPeriod && matchesCertification;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Terminée
          </div>
        );
      case 'accepted':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Acceptée
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Refusée
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            {status}
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des missions...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header - Mobile First */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d4a70] mb-2">Missions réalisées</h1>
            <p className="text-gray-600 text-sm sm:text-base">Consultez l'historique de vos missions</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile First Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-[#0d4a70] mb-1">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stats.completed}</div>
          <div className="text-xs sm:text-sm text-gray-600">Terminées</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{stats.accepted}</div>
          <div className="text-xs sm:text-sm text-gray-600">Acceptées</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-gray-600">Refusées</div>
        </Card>
      </div>

      {/* Filters - Mobile First */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#0d4a70]" />
          <h3 className="font-semibold text-[#0d4a70]">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="completed">Terminées</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Toutes les périodes</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
            <input
              type="text"
              placeholder="Rechercher..."
              value={certificationFilter}
              onChange={(e) => setCertificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setStatusFilter('');
                setPeriodFilter('');
                setCertificationFilter('');
              }}
              variant="outline"
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Missions List - Mobile First */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Historique des missions</h3>
            <div className="text-sm text-gray-600">
              {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''} affichée{filteredMissions.length > 1 ? 's' : ''} 
              {filteredMissions.length !== stats.total && ` sur ${stats.total} au total`}
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Erreur</div>
            <div className="text-gray-600">{error}</div>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
            <p className="text-gray-600">
              {missions.length === 0 
                ? "Vous n'avez pas encore de missions passées."
                : "Aucune mission ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMissions.map((mission, index) => (
              <div key={mission.id || index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#0d4a70]">
                        {mission.certification_title || 'Certification'}
                      </h3>
                      {getStatusBadge(mission.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {mission.certification_code && `${mission.certification_code} - `}Mission du {formatDate(mission.session_date)}
                    </p>
                  </div>
                </div>

                {/* Center Info - Mobile First */}
                <div className="flex items-center gap-3 mb-4">
                  <CenterAvatar centerName={mission.center_name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0d4a70] truncate">{mission.center_name}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {mission.center_city && mission.center_region 
                        ? `${mission.center_city}, ${mission.center_region}`
                        : mission.center_region || 'Localisation non spécifiée'
                      }
                    </div>
                  </div>
                </div>

                {/* Mission Details Grid - Mobile First */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Candidats</div>
                    <div className="text-gray-600 text-sm">{mission.candidate_count}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Modalité</div>
                    <div className="text-gray-600 text-sm">
                      {mission.modality === 'presentiel' ? 'Présentiel' : 
                       mission.modality === 'visio' ? 'Visioconférence' : 'Hybride'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Horaires</div>
                    <div className="text-gray-600 text-sm">
                      {mission.session_start_time && mission.session_end_time 
                        ? `${formatTime(mission.session_start_time)} - ${formatTime(mission.session_end_time)}`
                        : 'Non défini'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Lieu</div>
                    <div className="text-gray-600 text-sm">{mission.session_location || 'À distance'}</div>
                  </div>
                </div>

                {/* Benefits - Mobile First */}
                {(mission.transport_covered || mission.meals_covered || mission.accommodation_covered) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mission.transport_covered && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        🚗 Transport pris en charge
                      </span>
                    )}
                    {mission.meals_covered && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        🍽️ Repas pris en charge
                      </span>
                    )}
                    {mission.accommodation_covered && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        🏨 Hébergement pris en charge
                      </span>
                    )}
                  </div>
                )}

                {/* Custom Message if available */}
                {mission.custom_message && (
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 mb-4">
                    <div className="text-sm text-[#0d4a70] italic">
                      💬 "{mission.custom_message}" - {mission.center_name}
                    </div>
                  </div>
                )}

                {/* Actions - Mobile First */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                  {mission.status === 'completed' && new Date(mission.session_date) < new Date() && (
                    missionRatings[mission.id] ? (
                      <Button size="sm" variant="outline" disabled className="text-green-600 w-full sm:w-auto">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        Évalué
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-[#0d4a70] hover:bg-[#0d4a70]/90 w-full sm:w-auto"
                        onClick={() => handleOpenRatingModal(mission)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Donner un avis
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rating Modal */}
      {ratingModal.isOpen && ratingModal.mission && ratingModal.centerId && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={closeRatingModal}
          onSubmit={handleSubmitRating}
          session={{
            id: ratingModal.mission.id,
            certification_title: ratingModal.mission.certification_title,
            session_date: ratingModal.mission.session_date,
            center_name: ratingModal.mission.center_name
          }}
          userType="jury"
          ratedUserId={ratingModal.centerId}
        />
      )}
    </section>
  );
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function MissionsPageContent() {
  const searchParams = useSearchParams();
  const { data: user } = useSWR('/api/user', fetcher);
  
  // Show loading state while determining user type
  if (!user) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    );
  }
  
  // Only allow jury users to access this page
  if (user.userType !== 'jury') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Accès non autorisé pour ce type d'utilisateur</div>
        </div>
      </section>
    );
  }
  
  return <JuryMissionsPage />;
}

// Main component with Suspense boundary
export default function MissionsPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    }>
      <MissionsPageContent />
    </Suspense>
  );
}
