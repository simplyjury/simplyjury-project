'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Clock, Award, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';

interface RatingData {
  totalRatings: number;
  averageRatings: {
    communication: number;
    punctuality: number;
    expertise: number;
    overall: number;
  } | null;
  recommendationPercentage: number;
  ratings: Array<{
    id: number;
    communication_rating: number;
    punctuality_rating: number;
    expertise_rating: number;
    overall_rating: number;
    comment?: string;
    would_recommend?: boolean;
    created_at: string;
    certification_title: string;
    session_date: string;
    center_name: string;
  }>;
}

interface JuryRatingsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function JuryRatingsSection({ isExpanded, onToggle }: JuryRatingsSectionProps) {
  const [ratingsData, setRatingsData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jury-ratings');
      const result = await response.json();
      
      if (result.success) {
        setRatingsData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des évaluations');
      console.error('Error fetching jury ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Chargement des évaluations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!ratingsData || ratingsData.totalRatings === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0d4a70] flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Mes évaluations
          </h2>
        </div>
        <div className="text-center py-8">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation reçue</h3>
          <p className="text-gray-600">
            Vous n'avez pas encore reçu d'évaluations des centres de formation.
          </p>
        </div>
      </div>
    );
  }

  const { averageRatings, totalRatings, recommendationPercentage, ratings } = ratingsData;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="text-xl font-bold text-[#0d4a70] flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Mes évaluations
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Overall Rating Summary */}
      <div className="mt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#0d4a70] mb-1">
              {averageRatings?.overall || 0}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRatings?.overall || 0), 'lg')}
            </div>
            <div className="text-sm text-gray-600">
              Note globale
            </div>
          </div>
          
          <div className="flex-1 pl-6 border-l border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Communication */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-[#0d4a70]" />
                  <span className="text-sm font-semibold text-[#0d4a70]">Communication</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {averageRatings?.communication || 0}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(averageRatings?.communication || 0), 'sm')}
                </div>
              </div>

              {/* Punctuality */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#0d4a70]" />
                  <span className="text-sm font-semibold text-[#0d4a70]">Ponctualité</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {averageRatings?.punctuality || 0}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(averageRatings?.punctuality || 0), 'sm')}
                </div>
              </div>

              {/* Expertise */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-[#0d4a70]" />
                  <span className="text-sm font-semibold text-[#0d4a70]">Expertise</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {averageRatings?.expertise || 0}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(averageRatings?.expertise || 0), 'sm')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <span>
              <strong>Basé sur {totalRatings} avis reçu{totalRatings > 1 ? 's' : ''}</strong>
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <strong>{recommendationPercentage}%</strong> de recommandations
            </span>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      {isExpanded && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">
            Détail des évaluations ({totalRatings})
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ratings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-[#0d4a70] mb-1">
                      {rating.center_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {rating.certification_title} - Session du {formatDate(rating.session_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(rating.overall_rating, 'sm')}
                      <span className="text-sm font-semibold">{rating.overall_rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(rating.created_at)}
                    </div>
                  </div>
                </div>

                {/* Individual Criteria */}
                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600 mb-1">Communication</div>
                    <div className="flex items-center justify-center gap-1">
                      {renderStars(rating.communication_rating, 'sm')}
                      <span className="text-xs">{rating.communication_rating}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 mb-1">Ponctualité</div>
                    <div className="flex items-center justify-center gap-1">
                      {renderStars(rating.punctuality_rating, 'sm')}
                      <span className="text-xs">{rating.punctuality_rating}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 mb-1">Expertise</div>
                    <div className="flex items-center justify-center gap-1">
                      {renderStars(rating.expertise_rating, 'sm')}
                      <span className="text-xs">{rating.expertise_rating}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {rating.comment && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-gray-700 italic">
                      "{rating.comment}"
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {rating.would_recommend !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    {rating.would_recommend ? (
                      <>
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Recommande ce jury</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 text-red-600 rotate-180" />
                        <span className="text-red-600 font-medium">Ne recommande pas ce jury</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
