'use client';

import { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Star, MessageSquare, Calendar, Award, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RatingReceived {
  id: number;
  communicationRating: number;
  punctualityRating: number;
  expertiseRating: number;
  overallRating: number;
  comment: string;
  wouldRecommend: boolean;
  certificationTitle: string;
  certificationCode: string;
  sessionDate: string;
  centerName: string;
  date: string;
}

interface RatingGiven {
  id: number;
  communicationRating: number;
  punctualityRating: number;
  expertiseRating: number;
  overallRating: number;
  comment: string;
  wouldRecommend: boolean;
  centerName: string;
  certificationTitle: string;
  certificationCode: string;
  sessionDate: string;
  formattedSessionDate: string;
  date: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );
}

function RatingsReceivedTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ratingsData, error, isLoading } = useSWR(
    `/api/jury/ratings-received?page=${currentPage}&limit=12`, 
    fetcher
  );

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
        <div className="text-gray-600">Impossible de charger les évaluations</div>
      </div>
    );
  }

  const data = ratingsData?.data;
  const averages = data?.averages;
  const ratings = data?.ratings || [];
  const totalRatings = data?.totalRatings || 0;
  const pagination = data?.pagination;

  if (totalRatings === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation reçue</h3>
        <p className="text-gray-600">
          Vous recevrez des évaluations après avoir terminé vos premières missions.
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
            <div className="text-2xl font-bold text-[#0d4a70] mb-2">{averages?.overall}/5</div>
            <div className="text-sm text-gray-600 mb-2">Note globale</div>
            <StarRating rating={averages?.overall || 0} size="md" />
            <div className="text-xs text-gray-500 mt-2">{totalRatings} évaluation{totalRatings > 1 ? 's' : ''}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{averages?.communication}/5</div>
            <div className="text-sm text-gray-600 mb-2">Communication</div>
            <StarRating rating={averages?.communication || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{averages?.punctuality}/5</div>
            <div className="text-sm text-gray-600 mb-2">Ponctualité</div>
            <StarRating rating={averages?.punctuality || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{averages?.expertise}/5</div>
            <div className="text-sm text-gray-600 mb-2">Expertise</div>
            <StarRating rating={averages?.expertise || 0} />
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
            {ratings.map((rating: RatingReceived) => (
              <div key={rating.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-[#0d4a70]">{rating.certificationTitle}</h4>
                    {rating.certificationCode && (
                      <p className="text-sm text-gray-600">Code: {rating.certificationCode}</p>
                    )}
                    <p className="text-sm text-gray-500">{rating.centerName} • {rating.date}</p>
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
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    );
  }

function RatingsGivenTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ratingsData, error, isLoading } = useSWR(
    `/api/jury/ratings-given?page=${currentPage}&limit=12`, 
    fetcher
  );

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
        <div className="text-gray-600">Impossible de charger les évaluations données</div>
      </div>
    );
  }

  const data = ratingsData?.data;
  const ratings = data?.ratings || [];
  const totalRatings = data?.totalRatings || 0;
  const pagination = data?.pagination;

  if (totalRatings === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation donnée</h3>
        <p className="text-gray-600">
          Vous pourrez évaluer les centres après avoir terminé vos missions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Évaluations données aux centres ({totalRatings})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratings.map((rating: RatingGiven) => (
              <div key={rating.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-[#0d4a70]">{rating.centerName}</h4>
                    <p className="text-sm text-gray-600">{rating.certificationTitle}</p>
                    {rating.certificationCode && (
                      <p className="text-sm text-gray-500">RNCP: {rating.certificationCode}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{rating.formattedSessionDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating rating={rating.overallRating} />
                    <p className="text-xs text-gray-500 mt-1">Évalué le {rating.date}</p>
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
                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Votre commentaire:</span> "{rating.comment}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}

function EvaluationsPageContent() {
  const searchParams = useSearchParams();
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  
  // Role detection logic following the documented pattern
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfile?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));
  
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
  
  // Only allow jury users to access evaluations
  if (!isJury) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès réservé aux jurys</h3>
          <p className="text-gray-600">
            Cette page est uniquement accessible aux utilisateurs avec un profil jury.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Évaluations</h1>
        <p className="text-gray-600">Consultez vos évaluations reçues et données</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
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
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'received' && <RatingsReceivedTab />}
      {activeTab === 'given' && <RatingsGivenTab />}
    </section>
  );
}

// Main component with Suspense boundary
export default function EvaluationsPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    }>
      <EvaluationsPageContent />
    </Suspense>
  );
}
