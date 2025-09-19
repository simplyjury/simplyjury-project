'use client';

import { useState } from 'react';
import { Star, MessageCircle, Clock, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratingData: RatingData) => Promise<void>;
  session: {
    id: number;
    certification_title: string;
    session_date: string;
    jury_name?: string;
    center_name?: string;
  };
  userType: 'centre' | 'jury';
  ratedUserId: number;
}

interface RatingData {
  jury_request_id: number;
  rated_id: number;
  communication_rating: number;
  punctuality_rating: number;
  expertise_rating: number;
  comment?: string;
  would_recommend?: boolean;
}

interface RatingCriterion {
  key: keyof Pick<RatingData, 'communication_rating' | 'punctuality_rating' | 'expertise_rating'>;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  label, 
  description 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  label: string;
  description: string;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-[#0d4a70]">{label}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-colors"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onRatingChange(star)}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  session,
  userType,
  ratedUserId
}: RatingModalProps) {
  const [ratings, setRatings] = useState({
    communication_rating: 0,
    punctuality_rating: 0,
    expertise_rating: 0
  });
  const [hoverStates, setHoverStates] = useState({
    communication_rating: 0,
    punctuality_rating: 0,
    expertise_rating: 0
  });
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria: RatingCriterion[] = [
    {
      key: 'communication_rating',
      label: 'Communication',
      description: 'Qualité de la communication et des échanges',
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      key: 'punctuality_rating',
      label: 'Ponctualité',
      description: 'Respect des horaires et des délais',
      icon: <Clock className="w-5 h-5" />
    },
    {
      key: 'expertise_rating',
      label: 'Expertise',
      description: userType === 'centre' 
        ? 'Niveau d\'expertise et compétences techniques'
        : 'Organisation et préparation de la session',
      icon: <Award className="w-5 h-5" />
    }
  ];

  const handleRatingChange = (criterion: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [criterion]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all ratings are provided
    if (ratings.communication_rating === 0 || ratings.punctuality_rating === 0 || ratings.expertise_rating === 0) {
      alert('Veuillez donner une note pour tous les critères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        jury_request_id: session.id,
        rated_id: ratedUserId,
        ...ratings,
        comment: comment.trim() || undefined,
        would_recommend: wouldRecommend || undefined
      });
      
      // Reset form
      setRatings({
        communication_rating: 0,
        punctuality_rating: 0,
        expertise_rating: 0
      });
      setHoverStates({
        communication_rating: 0,
        punctuality_rating: 0,
        expertise_rating: 0
      });
      setComment('');
      setWouldRecommend(null);
      
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erreur lors de l\'envoi de l\'évaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = ratings.communication_rating && ratings.punctuality_rating && ratings.expertise_rating
    ? ((ratings.communication_rating + ratings.punctuality_rating + ratings.expertise_rating) / 3).toFixed(1)
    : '0.0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70]">Donner un avis</h2>
              <p className="text-gray-600">
                Évaluez {userType === 'centre' ? 'le jury' : 'le centre'} pour la session du{' '}
                {new Date(session.session_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">{session.certification_title}</h3>
            <p className="text-sm text-gray-600">
              {userType === 'centre' ? `Jury: ${session.jury_name}` : `Centre: ${session.center_name}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Criteria */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Évaluation par critères</h3>
              
              {criteria.map((criterion) => (
                <div key={criterion.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#0d4a70]">{criterion.icon}</div>
                      <div>
                        <h4 className="font-semibold text-[#0d4a70]">{criterion.label}</h4>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-colors"
                          onMouseEnter={() => setHoverStates(prev => ({ ...prev, [criterion.key]: star }))}
                          onMouseLeave={() => setHoverStates(prev => ({ ...prev, [criterion.key]: 0 }))}
                          onClick={() => handleRatingChange(criterion.key, star)}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverStates[criterion.key] || ratings[criterion.key])
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Rating Display */}
            {averageRating !== '0.0' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0d4a70]">Note globale</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#0d4a70]">{averageRating}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(parseFloat(averageRating))
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#0d4a70]">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce jury/centre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{comment.length}/500 caractères</p>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <label className="block font-semibold text-[#0d4a70]">
                Recommanderiez-vous {userType === 'centre' ? 'ce jury' : 'ce centre'} ?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    wouldRecommend === true
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  👍 Oui
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    wouldRecommend === false
                      ? 'bg-red-100 border-red-500 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  👎 Non
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#0d4a70] hover:bg-[#0d4a70]/90"
                disabled={isSubmitting || averageRating === '0.0'}
              >
                {isSubmitting ? 'Envoi...' : 'Publier l\'avis'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
