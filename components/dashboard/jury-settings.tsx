'use client';

import { Settings, User, Bell, Shield, Key, Globe } from 'lucide-react';

export default function JurySettings() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Paramètres</h1>
        <p className="text-gray-600">Configurez votre compte jury</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Paramètres jury en développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section permettra de personnaliser votre expérience en tant que jury 
            et de gérer tous les aspects de votre compte professionnel.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Gestion des préférences de missions</li>
              <li>• Notifications pour nouvelles demandes</li>
              <li>• Paramètres de disponibilité</li>
              <li>• Sécurité et confidentialité</li>
              <li>• Préférences de communication</li>
              <li>• Gestion des tarifs</li>
              <li>• Zones d'intervention préférées</li>
              <li>• Modalités de travail (présentiel/visio)</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4 text-blue-500" />
              <span>Profil</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Bell className="w-4 h-4 text-yellow-500" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Sécurité</span>
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
