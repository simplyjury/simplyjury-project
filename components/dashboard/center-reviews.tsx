'use client';

import { Star, MessageSquare, Users, Calendar, MapPin, Building, Clock, ThumbsUp, ThumbsDown, AlertCircle, BarChart3 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JuryProfile {
  first_name?: string;
  last_name?: string;
  expertise_domains?: string[];
  current_position?: string;
  current_company?: string;
}

interface Jury {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  expertise_domains?: string[];
  current_position?: string;
  current_company?: string;
}

interface Session {
  id: number;
  session_date: string;
  certification_title: string;
  candidate_count: number;
  modality: string;
  location?: string;
}

interface Rating {
  id: number;
  overall_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  expertise_rating: number;
  comment?: string;
  would_recommend?: boolean;
  created_at: string;
  jury: Jury;
  session: Session;
}

interface ReviewsData {
  stats: {
    totalRatings: number;
    averageRating: number;
    uniqueJuries: number;
    uniqueSessions: number;
  };
  recentRatings: Rating[];
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses} ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className={`ml-1 font-medium ${size === 'md' ? 'text-sm' : 'text-xs'} text-gray-600`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function RatingCard({ rating }: { rating: Rating }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case 'presentiel': return 'Présentiel';
      case 'visio': return 'Visio';
      case 'hybride': return 'Hybride';
      default: return modality;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      {/* Header with jury info */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">
            {rating.jury.first_name && rating.jury.last_name 
              ? `${rating.jury.first_name} ${rating.jury.last_name}`
              : rating.jury.name
            }
          </h3>
          {rating.jury.current_position && (
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {rating.jury.current_position}
              {rating.jury.current_company && ` • ${rating.jury.current_company}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={rating.overall_rating} size="md" />
          {rating.would_recommend !== null && (
            <div className="ml-2">
              {rating.would_recommend ? (
                <ThumbsUp className="h-4 w-4 text-green-500" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session details */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(rating.session.session_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{rating.session.candidate_count} candidat{rating.session.candidate_count > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{getModalityLabel(rating.session.modality)}</span>
          </div>
          {rating.session.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{rating.session.location}</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">{rating.session.certification_title}</p>
        </div>
      </div>

      {/* Detailed ratings */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Communication</p>
          <StarRating rating={rating.communication_rating} />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Ponctualité</p>
          <StarRating rating={rating.punctuality_rating} />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Expertise</p>
          <StarRating rating={rating.expertise_rating} />
        </div>
      </div>

      {/* Comment */}
      {rating.comment && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 italic">"{rating.comment}"</p>
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>Évalué le {formatDate(rating.created_at)}</span>
      </div>
    </div>
  );
}

export default function CenterReviews() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: ReviewsData }>('/api/center/reviews', fetcher);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">Impossible de charger les avis. Veuillez réessayer.</p>
        </div>
      </div>
    );
  }

  const reviewsData = data?.data;
  const hasRatings = reviewsData && reviewsData.stats.totalRatings > 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d4a70] mb-2">Avis donnés</h1>
        <p className="text-sm md:text-base text-gray-600">Consultez et gérez tous les avis donnés aux jurys après vos sessions de certification</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col items-center text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Jurys évalués</p>
            <p className="text-xl md:text-2xl font-bold text-[#0d4a70]">
              {isLoading ? '...' : reviewsData?.stats.uniqueJuries || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col items-center text-center">
            <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Note moyenne</p>
            <p className="text-xl md:text-2xl font-bold text-[#0d4a70]">
              {isLoading ? '...' : reviewsData?.stats.averageRating ? `${reviewsData.stats.averageRating}/5` : '0/5'}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col items-center text-center">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-500 mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Sessions évaluées</p>
            <p className="text-xl md:text-2xl font-bold text-[#0d4a70]">
              {isLoading ? '...' : reviewsData?.stats.uniqueSessions || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col items-center text-center">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-500 mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total avis</p>
            <p className="text-xl md:text-2xl font-bold text-[#0d4a70]">
              {isLoading ? '...' : reviewsData?.stats.totalRatings || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      ) : hasRatings ? (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Avis récents</h2>
            <span className="text-sm text-gray-500">{reviewsData.recentRatings.length} avis affichés</span>
          </div>
          
          <div className="grid gap-4 md:gap-6">
            {reviewsData.recentRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <ThumbsUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-[#0d4a70] mb-3 md:mb-4">
              Aucun avis donné pour le moment
            </h2>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
              Vous pourrez évaluer les jurys après vos sessions de certification terminées.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 md:mb-6">
              <h3 className="font-semibold text-[#0d4a70] mb-2 text-sm md:text-base">Comment ça marche :</h3>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1 text-left">
                <li>• Organisez une session avec un jury</li>
                <li>• Attendez la fin de la session</li>
                <li>• Évaluez le jury sur 3 critères</li>
                <li>• Laissez un commentaire (optionnel)</li>
                <li>• Recommandez ou non le jury</li>
              </ul>
            </div>
            
            <div className="text-xs md:text-sm text-gray-500">
              Vos évaluations aident à améliorer la qualité du service.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
