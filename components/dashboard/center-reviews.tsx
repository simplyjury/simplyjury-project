'use client';

import { useState } from 'react';
import { Star, MessageSquare, Users, Calendar, MapPin, Building, Clock, ThumbsUp, ThumbsDown, AlertCircle, BarChart3, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Tab for ratings given to juries
function RatingsGivenTab() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: ReviewsData }>('/api/center/reviews', fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des évaluations données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Erreur</div>
        <div className="text-gray-600">Impossible de charger les évaluations</div>
      </div>
    );
  }

  const reviewsData = data?.data;
  const totalRatings = reviewsData?.stats.totalRatings || 0;

  if (totalRatings === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation donnée</h3>
        <p className="text-gray-600">
          Vous pourrez évaluer les jurys après avoir terminé vos sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#0d4a70] mb-2">{reviewsData?.stats.averageRating}/5</div>
            <div className="text-sm text-gray-600 mb-2">Note moyenne donnée</div>
            <StarRating rating={reviewsData?.stats.averageRating || 0} size="md" />
            <div className="text-xs text-gray-500 mt-2">{totalRatings} évaluation{totalRatings > 1 ? 's' : ''}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{reviewsData?.stats.uniqueJuries}</div>
            <div className="text-sm text-gray-600 mb-2">Jurys évalués</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{reviewsData?.stats.uniqueSessions}</div>
            <div className="text-sm text-gray-600 mb-2">Sessions évaluées</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{totalRatings}</div>
            <div className="text-sm text-gray-600 mb-2">Total évaluations</div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Évaluations données aux jurys ({totalRatings})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviewsData?.recentRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tab for ratings received from juries
function RatingsReceivedTab() {
  const { data, error, isLoading } = useSWR('/api/center/ratings-received', fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des évaluations reçues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Erreur</div>
        <div className="text-gray-600">Impossible de charger les évaluations reçues</div>
      </div>
    );
  }

  const ratingsData = data?.data;
  const totalRatings = ratingsData?.totalRatings || 0;

  if (totalRatings === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation reçue</h3>
        <p className="text-gray-600">
          Vous recevrez des évaluations des jurys après vos sessions terminées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Ratings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#0d4a70] mb-2">{ratingsData?.averages?.overall}/5</div>
            <div className="text-sm text-gray-600 mb-2">Note globale</div>
            <StarRating rating={ratingsData?.averages?.overall || 0} size="md" />
            <div className="text-xs text-gray-500 mt-2">{totalRatings} évaluation{totalRatings > 1 ? 's' : ''}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{ratingsData?.averages?.communication}/5</div>
            <div className="text-sm text-gray-600 mb-2">Communication</div>
            <StarRating rating={ratingsData?.averages?.communication || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{ratingsData?.averages?.punctuality}/5</div>
            <div className="text-sm text-gray-600 mb-2">Ponctualité</div>
            <StarRating rating={ratingsData?.averages?.punctuality || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{ratingsData?.averages?.expertise}/5</div>
            <div className="text-sm text-gray-600 mb-2">Expertise</div>
            <StarRating rating={ratingsData?.averages?.expertise || 0} />
          </CardContent>
        </Card>
      </div>

      {/* Individual Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Évaluations détaillées ({totalRatings})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratingsData?.ratings?.map((rating: any) => (
              <div key={rating.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-[#0d4a70]">Jury professionnel</h4>
                    <p className="text-sm text-gray-600">{rating.certificationTitle}</p>
                    {rating.certificationCode && (
                      <p className="text-sm text-gray-500">Code: {rating.certificationCode}</p>
                    )}
                    <p className="text-sm text-gray-500">{rating.date}</p>
                  </div>
                  <div className="text-right">
                    <StarRating rating={rating.overallRating} />
                    {rating.wouldRecommend && (
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Recommandé</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Communication:</span>
                    <StarRating rating={rating.communicationRating} />
                  </div>
                  <div>
                    <span className="text-gray-600">Ponctualité:</span>
                    <StarRating rating={rating.punctualityRating} />
                  </div>
                  <div>
                    <span className="text-gray-600">Expertise:</span>
                    <StarRating rating={rating.expertiseRating} />
                  </div>
                </div>

                {rating.comment && (
                  <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700 italic">"{rating.comment}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CenterReviews() {
  const [activeTab, setActiveTab] = useState<'given' | 'received'>('given');

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Évaluations</h1>
        <p className="text-gray-600">Consultez vos évaluations données et reçues</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('given')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'given'
                  ? 'border-[#0d4a70] text-[#0d4a70]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Évaluations données
              </div>
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-[#0d4a70] text-[#0d4a70]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Évaluations reçues
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'given' && <RatingsGivenTab />}
      {activeTab === 'received' && <RatingsReceivedTab />}
    </section>
  );
}
