'use client';

import { Star, MessageSquare, BarChart3, Users, ThumbsUp } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CenterReviews() {
  const { data: reviews } = useSWR('/api/center/reviews', fetcher);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Avis donnés</h1>
        <p className="text-gray-600">Gérez les avis donnés aux jurys après les sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jurys évalués</p>
              <p className="text-2xl font-bold text-[#0d4a70]">18</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne donnée</p>
              <p className="text-2xl font-bold text-[#0d4a70]">4.6/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions évaluées</p>
              <p className="text-2xl font-bold text-[#0d4a70]">32</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <ThumbsUp className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Système d'évaluation en développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section permettra de consulter et gérer tous les avis donnés 
            aux jurys après vos sessions de certification.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Évaluation des jurys après chaque session</li>
              <li>• Historique des avis donnés</li>
              <li>• Statistiques de satisfaction</li>
              <li>• Commentaires détaillés</li>
              <li>• Suivi des performances des jurys</li>
              <li>• Recommandations de jurys</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            Cette page sera bientôt disponible dans une prochaine mise à jour.
          </div>
        </div>
      </div>
    </div>
  );
}
