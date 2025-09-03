'use client';

import { Crown, Zap, Users, BarChart3, MessageCircle, Shield } from 'lucide-react';

export default function UpgradePage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Passer au Pro</h1>
        <p className="text-gray-600">Découvrez nos offres premium</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-[#fdce0f] to-[#f4b942] rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Offres Premium en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Découvrez bientôt nos plans premium pour débloquer toutes les fonctionnalités 
            avancées de SimplyJury et maximiser vos opportunités.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Avantages Premium à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Contacts illimités avec les jurys</li>
              <li>• Recherche avancée et filtres premium</li>
              <li>• Statistiques détaillées et analytics</li>
              <li>• Support prioritaire</li>
              <li>• Fonctionnalités de messagerie avancées</li>
              <li>• Badges et certifications de qualité</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Accès prioritaire</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Support premium</span>
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
