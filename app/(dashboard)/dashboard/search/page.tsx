'use client';

import { Search, Filter, MapPin, Star, Users } from 'lucide-react';

export default function SearchPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Rechercher un jury</h1>
        <p className="text-gray-600">Trouvez le jury parfait pour votre certification</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Recherche de jurys en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette fonctionnalité permettra aux centres de formation de rechercher 
            et contacter des jurys qualifiés selon leurs critères spécifiques.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Recherche par domaine d'expertise</li>
              <li>• Filtres géographiques avancés</li>
              <li>• Disponibilités en temps réel</li>
              <li>• Profils détaillés des jurys</li>
              <li>• Système de notation et avis</li>
              <li>• Contact direct et demandes structurées</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Localisation</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Évaluations</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-green-500" />
              <span>Disponibilité</span>
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
