'use client';

import { MessageCircle, Search, Filter, Plus } from 'lucide-react';

export default function MessagesPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Messagerie</h1>
        <p className="text-gray-600">Gérez vos conversations avec les jurys</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Messagerie en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette fonctionnalité permettra de communiquer directement avec les jurys, 
            de gérer vos conversations et de transformer les demandes de contact en missions structurées.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Messagerie interne avec les jurys</li>
              <li>• Gestion des conversations par mission</li>
              <li>• Transformation des contacts en demandes structurées</li>
              <li>• Historique des échanges</li>
              <li>• Notifications en temps réel</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            Cette page sera bientôt disponible dans une prochaine mise à jour.
          </div>
        </div>
      </div>
    </section>
  );
}
