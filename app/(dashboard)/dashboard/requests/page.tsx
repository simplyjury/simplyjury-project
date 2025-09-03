'use client';

import { FileText, Search, Filter, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function RequestsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Mes demandes</h1>
        <p className="text-gray-600">Suivez vos demandes en cours</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Gestion des demandes en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section permettra de suivre toutes vos demandes de jury, 
            de gérer leur statut et de communiquer avec les centres de formation.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Suivi des demandes en temps réel</li>
              <li>• Statuts : En attente, Acceptée, Refusée, Terminée</li>
              <li>• Détails des missions de certification</li>
              <li>• Communication avec les centres</li>
              <li>• Historique complet des demandes</li>
              <li>• Filtres et recherche avancée</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>En attente</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Acceptée</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Refusée</span>
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
