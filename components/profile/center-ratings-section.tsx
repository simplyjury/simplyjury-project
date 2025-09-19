'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Star, ThumbsUp, Users, Calendar, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CenterRatingsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface Rating {
  id: number;
  overall_rating: number;
  comment?: string;
  would_recommend: boolean;
  created_at: string;
  jury: {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    expertise_domains?: string[];
    current_position?: string;
    current_company?: string;
  };
  session: {
    id: number;
    session_date: string;
    certification_title: string;
    candidate_count: number;
    modality: string;
    location?: string;
  };
}

interface RatingsStats {
  totalRatings: number;
  averageRating: number;
  recommendationPercentage: number;
  uniqueJuries: number;
  uniqueSessions: number;
}

interface RatingsData {
  stats: RatingsStats;
  recentRatings: Rating[];
}

// Jury Avatar Component with fallback to initials
interface JuryAvatarProps {
  juryName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function JuryAvatar({ juryName, firstName, lastName }: JuryAvatarProps) {
  const getInitials = (name: string | null | undefined, first?: string | null, last?: string | null) => {
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    if (name) {
      return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'JU';
  };

  return (
    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
      {getInitials(juryName, firstName, lastName)}
    </div>
  );
}

// Star Rating Display Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
      ))}
    </div>
  );
}

export default function CenterRatingsSection({ isExpanded, onToggle }: CenterRatingsSectionProps) {
  const [showAllRatings, setShowAllRatings] = useState(false);
  
  const { data: ratingsResponse, error, isLoading } = useSWR<{ success: boolean; data: RatingsData }>(
    '/api/center-ratings',
    fetcher
  );

  const ratingsData = ratingsResponse?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case 'presentiel': return 'Présentiel';
      case 'visio': return 'Visioconférence';
      case 'hybride': return 'Hybride';
      default: return modality;
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Erreur lors du chargement des évaluations</div>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
          <h2 className="text-xl font-bold text-[#0d4a70]">Évaluations des jurys</h2>
          <p className="text-sm text-gray-500 ml-2">
            {isLoading ? 'Chargement...' : `${ratingsData?.stats.totalRatings || 0} avis reçus`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d4a70]"></div>
            </div>
          ) : !ratingsData || ratingsData.stats.totalRatings === 0 ? (
            <div className="text-center py-8">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation</h3>
              <p className="text-gray-600">
                Vous n'avez pas encore reçu d'évaluations de la part des jurys.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <StarRating rating={ratingsData.stats.averageRating} size="md" />
                  </div>
                  <div className="text-2xl font-bold text-[#0d4a70] mb-1">
                    {ratingsData.stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Note moyenne</div>
                </Card>

                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {ratingsData.stats.recommendationPercentage}%
                  </div>
                  <div className="text-xs text-gray-600">Recommandations</div>
                </Card>

                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {ratingsData.stats.uniqueJuries}
                  </div>
                  <div className="text-xs text-gray-600">Jurys évaluateurs</div>
                </Card>

                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {ratingsData.stats.uniqueSessions}
                  </div>
                  <div className="text-xs text-gray-600">Sessions évaluées</div>
                </Card>
              </div>

              {/* Recent Ratings */}
              {ratingsData.recentRatings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#0d4a70]">Avis récents</h3>
                    {ratingsData.recentRatings.length > 3 && (
                      <button
                        onClick={() => setShowAllRatings(!showAllRatings)}
                        className="text-[#0d4a70] hover:text-[#0a3a5a] text-sm font-medium"
                      >
                        {showAllRatings ? 'Voir moins' : 'Voir tous les avis'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {(showAllRatings ? ratingsData.recentRatings : ratingsData.recentRatings.slice(0, 3)).map((rating) => (
                      <Card key={rating.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <JuryAvatar 
                            juryName={rating.jury.name}
                            firstName={rating.jury.first_name}
                            lastName={rating.jury.last_name}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold text-[#0d4a70]">
                                  {rating.jury.first_name && rating.jury.last_name 
                                    ? `${rating.jury.first_name} ${rating.jury.last_name}`
                                    : rating.jury.name
                                  }
                                </div>
                                {rating.jury.current_position && rating.jury.current_company && (
                                  <div className="text-sm text-gray-600">
                                    {rating.jury.current_position} chez {rating.jury.current_company}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <StarRating rating={rating.overall_rating} size="sm" />
                                  <span className="text-sm font-medium text-[#0d4a70]">
                                    {rating.overall_rating}/5
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(rating.created_at)}
                                </div>
                              </div>
                            </div>

                            {/* Session Info */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="text-sm font-medium text-[#0d4a70] mb-1">
                                {rating.session.certification_title}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(rating.session.session_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {rating.session.candidate_count} candidats
                                </span>
                                <span>{getModalityLabel(rating.session.modality)}</span>
                              </div>
                            </div>

                            {/* Comment */}
                            {rating.comment && (
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-gray-700 italic">
                                    "{rating.comment}"
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Recommendation */}
                            {rating.would_recommend !== null && (
                              <div className="flex items-center gap-2">
                                <ThumbsUp className={`w-4 h-4 ${rating.would_recommend ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={`text-sm ${rating.would_recommend ? 'text-green-600' : 'text-gray-600'}`}>
                                  {rating.would_recommend ? 'Recommande ce centre' : 'Ne recommande pas ce centre'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
