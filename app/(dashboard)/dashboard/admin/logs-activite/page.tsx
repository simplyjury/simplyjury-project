'use client';

import { Activity, Search, Filter, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function LogsActivitePage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Logs d'activité</h1>
        <p className="text-gray-600">Suivi des activités et événements de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
              <option value="">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="success">Succès</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
              <option value="">Toutes les actions</option>
              <option value="login">Connexions</option>
              <option value="profile">Profils</option>
              <option value="admin">Actions admin</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Activités récentes</h3>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Profil validé</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Succès</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                L'administrateur Cédric Kerbidi a validé le profil de Marie Dubois (Jury)
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>IP: 192.168.1.100</span>
                <span>User-Agent: Chrome 118.0.0.0</span>
                <span>Il y a 5 minutes</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Nouvelle inscription</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Info</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Nouveau centre de formation inscrit: "Formation Excellence Pro" (Lyon)
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>IP: 78.234.156.89</span>
                <span>User-Agent: Firefox 119.0</span>
                <span>Il y a 15 minutes</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Tentative de connexion échouée</span>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Avertissement</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                5 tentatives de connexion échouées pour l'email: test@example.com
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>IP: 45.123.67.89</span>
                <span>User-Agent: Unknown</span>
                <span>Il y a 32 minutes</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Mise en relation créée</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Succès</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Nouvelle mise en relation entre "Centre Formation Pro" et "Pierre Martin" (Jury)
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Automatique</span>
                <span>Système</span>
                <span>Il y a 1 heure</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Erreur de synchronisation</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Erreur</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Échec de synchronisation avec l'API France Compétences - Timeout après 30s
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Service: france-competences-sync</span>
                <span>Error: TIMEOUT</span>
                <span>Il y a 2 heures</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Export de données</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Info</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                L'administrateur Cédric Kerbidi a exporté la liste des utilisateurs (1,247 entrées)
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Format: Excel</span>
                <span>Taille: 2.3 MB</span>
                <span>Il y a 3 heures</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage des 50 dernières activités
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Charger plus
              </button>
              <button className="px-3 py-1 text-sm bg-[#0d4a70] text-white rounded hover:bg-[#0a3a5a]">
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
