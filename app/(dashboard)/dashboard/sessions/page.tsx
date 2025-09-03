'use client';

import { Calendar, Clock, MapPin, Award, TrendingUp } from 'lucide-react';

export default function SessionsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Sessions réalisées</h1>
        <p className="text-gray-600">Consultez l'historique de vos examens</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Historique des sessions en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section permettra de consulter l'historique complet de vos sessions 
            de certification et de suivre vos statistiques de performance.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Historique complet des sessions</li>
              <li>• Détails par certification et centre</li>
              <li>• Statistiques de performance</li>
              <li>• Calendrier des sessions passées</li>
              <li>• Rapports d'évaluation</li>
              <li>• Export des données</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Durée</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Certifications</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Statistiques</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Cette page sera bientôt disponible dans une prochaine mise à jour.
          </div>
        </div>
      </div>
    </div>
  );
}
