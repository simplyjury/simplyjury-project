'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Calendar, Clock, CheckCircle, XCircle, FileText, MapPin, Users, Eye, Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RatingModal from '@/components/ratings/rating-modal';
import { JuryProfileModal } from '@/components/ui/jury-profile-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Jury Avatar Component with fallback to initials
interface JuryAvatarProps {
  profilePhoto?: string | null;
  juryName?: string | null;
}

function JuryAvatar({ profilePhoto, juryName }: JuryAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'JU';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  if (!profilePhoto || imageError) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
        {getInitials(juryName)}
      </div>
    );
  }

  return (
    <img 
      src={profilePhoto} 
      alt={juryName || 'Jury'} 
      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
      onError={() => setImageError(true)}
    />
  );
}

interface Session {
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
  jury_id: number;
  jury_name: string;
  jury_profile_photo?: string;
  jury_rating?: string;
  jury_reviews?: string;
}

interface SessionStats {
  total: number;
  completed: number;
  accepted: number;
  rejected: number;
}

// Center sessions component
function CenterSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats>({ total: 0, completed: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [certificationFilter, setCertificationFilter] = useState<string>('');
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    session: Session | null;
    juryId: number | null;
  }>({ isOpen: false, session: null, juryId: null });
  const [sessionRatings, setSessionRatings] = useState<Record<number, boolean>>({});
  const [juryRatings, setJuryRatings] = useState<Record<number, { averageRating: number; totalRatings: number }>>({});
  const [juryProfileModal, setJuryProfileModal] = useState<{
    isOpen: boolean;
    juryProfile: any | null;
  }>({ isOpen: false, juryProfile: null });
  const [loadingJuryProfile, setLoadingJuryProfile] = useState(false);

  useEffect(() => {
    fetchCenterSessions();
  }, []); // Fetch all data once for client-side filtering

  const fetchCenterSessions = async () => {
    try {
      setLoading(true);
      // Fetch all past sessions without filters for client-side filtering
      const response = await fetch(`/api/center-sessions`);
      const result = await response.json();
      
      if (result.success) {
        setSessions(result.data || []);
        calculateStats(result.data || []);
        // Check which sessions have been rated
        checkSessionRatings(result.data || []);
        // Fetch jury ratings summary
        fetchJuryRatings(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des sessions');
      console.error('Error fetching center sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkSessionRatings = async (sessionsData: Session[]) => {
    try {
      const ratingsStatus: Record<number, boolean> = {};
      
      // Check each session for existing ratings
      for (const session of sessionsData) {
        const response = await fetch(`/api/session-ratings?jury_request_id=${session.id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Check if center has already rated this session
          const centerRating = result.data.find((rating: any) => rating.rater_type === 'centre');
          ratingsStatus[session.id] = !!centerRating;
        }
      }
      
      setSessionRatings(ratingsStatus);
    } catch (error) {
      console.error('Error checking session ratings:', error);
    }
  };

  const fetchJuryRatings = async (sessionsData: Session[]) => {
    try {
      // Get unique jury IDs from sessions
      const juryIds = [...new Set(sessionsData.map(session => session.jury_id))];
      
      if (juryIds.length === 0) return;

      const response = await fetch(`/api/jury-ratings-summary?jury_ids=${juryIds.join(',')}`);
      const result = await response.json();
      
      if (result.success) {
        setJuryRatings(result.data);
      }
    } catch (error) {
      console.error('Error fetching jury ratings:', error);
    }
  };

  const handleOpenRatingModal = (session: Session) => {
    setRatingModal({
      isOpen: true,
      session,
      juryId: session.jury_id
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
        setSessionRatings(prev => ({
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

  const handleMarkAsCompleted = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/jury-requests/${sessionId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Update the session status in local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed' as const }
            : session
        ));
        
        // Recalculate stats
        const updatedSessions = sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed' as const }
            : session
        );
        calculateStats(updatedSessions);
        
        // Show success message
        alert('Session marquée comme terminée avec succès!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error marking session as completed:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const closeRatingModal = () => {
    setRatingModal({ isOpen: false, session: null, juryId: null });
  };

  const handleViewJuryProfile = async (juryUserId: number) => {
    try {
      setLoadingJuryProfile(true);
      const response = await fetch(`/api/jury/${juryUserId}`);
      const result = await response.json();

      if (result.success) {
        setJuryProfileModal({
          isOpen: true,
          juryProfile: result.data,
        });
      } else {
        alert('Erreur lors du chargement du profil');
      }
    } catch (error) {
      console.error('Error loading jury profile:', error);
      alert('Erreur lors du chargement du profil');
    } finally {
      setLoadingJuryProfile(false);
    }
  };

  const closeJuryProfileModal = () => {
    setJuryProfileModal({ isOpen: false, juryProfile: null });
  };

  const calculateStats = (sessionsData: Session[]) => {
    const stats = sessionsData.reduce((acc, session) => {
      acc.total++;
      switch (session.status) {
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
  const filteredSessions = sessions.filter(session => {
    // Apply status filter
    const matchesStatus = !statusFilter || session.status === statusFilter;
    
    // Apply period filter
    let matchesPeriod = true;
    if (periodFilter) {
      const sessionDate = new Date(session.session_date);
      const now = new Date();
      
      switch (periodFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesPeriod = sessionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesPeriod = sessionDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesPeriod = sessionDate >= quarterAgo;
          break;
      }
    }
    
    // Apply certification filter
    const matchesCertification = !certificationFilter || 
      (session.certification_title && session.certification_title.toLowerCase().includes(certificationFilter.toLowerCase()));
    
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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '⭐'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des sessions...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Sessions réalisées</h1>
            <p className="text-gray-600">Consultez l'historique de vos sessions passées</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#0d4a70]/10 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-[#0d4a70]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.completed}</div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Acceptées</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Refusées</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="completed">Terminées</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Période</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Toute période</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Certification</label>
            <select
              value={certificationFilter}
              onChange={(e) => setCertificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Toutes les certifications</option>
              <option value="informatique">Informatique</option>
              <option value="management">Management</option>
              <option value="commerce">Commerce</option>
            </select>
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

      {/* Sessions List */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Historique des sessions</h3>
            <div className="text-sm text-gray-600">
              {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''} affichée{filteredSessions.length > 1 ? 's' : ''} 
              {filteredSessions.length !== stats.total && ` sur ${stats.total} au total`}
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Erreur</div>
            <div className="text-gray-600">{error}</div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune session trouvée</h3>
            <p className="text-gray-600">
              {sessions.length === 0 
                ? "Vous n'avez pas encore de sessions passées."
                : "Aucune session ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session, index) => (
              <div key={session.id || index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[#0d4a70]">
                        {session.certification_title || 'Certification'}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-xs text-gray-600">
                      {session.certification_code && `${session.certification_code} - `}Session du {formatDate(session.session_date)}
                    </p>
                  </div>
                  
                  {/* Actions moved to header row */}
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir détails
                    </Button>
                    
                    {/* Mark as completed button - only for accepted sessions with past dates */}
                    {session.status === 'accepted' && new Date(session.session_date) < new Date() && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleMarkAsCompleted(session.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Marquer comme terminée
                      </Button>
                    )}
                    
                    {/* Rating button - only for completed sessions */}
                    {session.status === 'completed' && (
                      sessionRatings[session.id] ? (
                        <Button size="sm" variant="outline" disabled className="text-green-600">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          Évalué
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-[#0d4a70] hover:bg-[#0d4a70]/90"
                          onClick={() => handleOpenRatingModal(session)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Donner un avis
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Jury Info */}
                <div className="flex items-center gap-2 mb-3">
                  <JuryAvatar 
                    profilePhoto={session.jury_profile_photo} 
                    juryName={session.jury_name} 
                  />
                  <div>
                    <button
                      onClick={() => handleViewJuryProfile(session.jury_id)}
                      className="font-medium text-sm text-[#0d4a70] hover:text-[#13d090] hover:underline cursor-pointer transition-colors"
                      disabled={loadingJuryProfile}
                    >
                      {session.jury_name}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      {juryRatings[session.jury_id] && juryRatings[session.jury_id].totalRatings > 0 ? (
                        <>
                          <span className="text-yellow-500">
                            {renderStars(juryRatings[session.jury_id].averageRating)}
                          </span>
                          <span>
                            {juryRatings[session.jury_id].averageRating} ({juryRatings[session.jury_id].totalRatings} avis)
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">Aucune évaluation</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-[#0d4a70] text-xs">Candidats</div>
                    <div className="text-gray-600 text-xs">{session.candidate_count}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-[#0d4a70] text-xs">Modalité</div>
                    <div className="text-gray-600 text-xs">
                      {session.modality === 'presentiel' ? 'Présentiel' : 
                       session.modality === 'visio' ? 'Visioconférence' : 'Hybride'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-[#0d4a70] text-xs">Horaires</div>
                    <div className="text-gray-600 text-xs">
                      {session.session_start_time && session.session_end_time 
                        ? `${formatTime(session.session_start_time)} - ${formatTime(session.session_end_time)}`
                        : 'Non défini'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-[#0d4a70] text-xs">Lieu</div>
                    <div className="text-gray-600 text-xs">{session.session_location || 'À distance'}</div>
                  </div>
                </div>

                {/* Jury Response if available */}
                {session.jury_response && (
                  <div className="bg-gray-50 p-2 rounded border-l-4 border-blue-500">
                    <div className="text-xs text-[#0d4a70] italic">
                      💬 "{session.jury_response}" - {session.jury_name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rating Modal */}
      {ratingModal.isOpen && ratingModal.session && ratingModal.juryId && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={closeRatingModal}
          onSubmit={handleSubmitRating}
          session={{
            id: ratingModal.session.id,
            certification_title: ratingModal.session.certification_title,
            session_date: ratingModal.session.session_date,
            jury_name: ratingModal.session.jury_name
          }}
          userType="centre"
          ratedUserId={ratingModal.juryId}
        />
      )}

      {/* Jury Profile Modal */}
      {juryProfileModal.juryProfile && (
        <JuryProfileModal
          isOpen={juryProfileModal.isOpen}
          onClose={closeJuryProfileModal}
          jury={juryProfileModal.juryProfile}
        />
      )}
    </section>
  );
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SessionsPageContent() {
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
  
  // Only allow center users to access this page
  if (user.userType !== 'centre') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Accès non autorisé pour ce type d'utilisateur</div>
        </div>
      </section>
    );
  }
  
  return <CenterSessionsPage />;
}

// Main component with Suspense boundary
export default function SessionsPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    }>
      <SessionsPageContent />
    </Suspense>
  );
}
