'use client';

import { BarChart3, Users, AlertTriangle, TrendingUp, FileText, Settings, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Tableau de bord Administration</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme SimplyJury</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <FileText className="w-4 h-4" />
          Export rapport
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]">
          <Settings className="w-4 h-4" />
          Centre d'aide
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Action requise</h3>
          </div>
          <p className="text-red-700 text-sm">7 profils jurys en attente de validation depuis plus de 48h</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Pic d'activité détecté</h3>
          </div>
          <p className="text-yellow-700 text-sm">+45% d'inscriptions cette semaine. Vérifiez les capacités serveur.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
          <div className="text-sm text-gray-600 mb-2">Utilisateurs totaux</div>
          <div className="text-xs text-green-600">+16% ce mois</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">7</div>
          <div className="text-sm text-gray-600 mb-2">Profils en attente</div>
          <div className="text-xs text-red-600">Action requise</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">342</div>
          <div className="text-sm text-gray-600 mb-2">Mises en relation</div>
          <div className="text-xs text-green-600">+2% cette semaine</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">4.7</div>
          <div className="text-sm text-gray-600 mb-2">Note moyenne jury</div>
          <div className="text-xs text-gray-500">Stable</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Validation des profils jurys</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">Filtrer</button>
                <button className="px-3 py-1 text-sm bg-[#13d090] text-white rounded">Tout valider</button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    MD
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Marie Dubois</h4>
                    <p className="text-sm text-gray-600">Directrice Commerciale • Nice, PACA • 15 ans d'expérience</p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Management</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Commercial</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Formation</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Il y a 3h</span>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                    Valider
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                    Refuser
                  </button>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Plus de profils en attente de validation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Urgentes */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Actions urgentes</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">Profils en attente &gt; 48h</span>
                  <span className="text-sm font-bold text-red-800 ml-auto">7</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">Avis signalés</span>
                  <span className="text-sm font-bold text-yellow-800 ml-auto">3</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-orange-800">Comptes suspendus</span>
                  <span className="text-sm font-bold text-orange-800 ml-auto">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
