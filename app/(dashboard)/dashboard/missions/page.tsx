'use client';

import { Calendar, Search, Filter, Plus, Clock, CheckCircle, MapPin } from 'lucide-react';

export default function MissionsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Missions réalisées</h1>
        <p className="text-gray-600">Consultez l'historique de vos missions</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Gestion des missions en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section permettra de consulter l'historique complet de vos missions réalisées, 
            de gérer vos évaluations et de suivre vos performances.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Historique complet des missions réalisées</li>
              <li>• Détails des certifications évaluées</li>
              <li>• Évaluations reçues des centres de formation</li>
              <li>• Statistiques de performance</li>
              <li>• Filtres par date, centre, certification</li>
              <li>• Export des données de missions</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Terminée</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>En cours</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>Présentiel/Visio</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Cette page sera bientôt disponible dans une prochaine mise à jour.
          </div>
        </div>
      </div>
    </section>
  );
}
