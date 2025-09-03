'use client';

import { BarChart3, TrendingUp, Users, Building2, Star, Download } from 'lucide-react';

export default function StatistiquesGlobalesPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Statistiques globales</h1>
        <p className="text-gray-600">Analyse complète de l'activité de la plateforme</p>
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
          <Download className="w-4 h-4" />
          Exporter les données
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
          <div className="text-sm text-gray-600">Utilisateurs totaux</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">156</div>
          <div className="text-sm text-gray-600">Centres actifs</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">2,341</div>
          <div className="text-sm text-gray-600">Mises en relation</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Stable</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">4.7</div>
          <div className="text-sm text-gray-600">Satisfaction moyenne</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Croissance des inscriptions</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Graphique de croissance</p>
              <p className="text-sm">Données des 12 derniers mois</p>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Répartition des utilisateurs</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jurys</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-24 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">876 (70%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Centres</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">365 (29%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Administrateurs</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-1 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">6 (1%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Répartition géographique</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">Île-de-France</div>
            <div className="text-sm text-gray-600 mb-2">342 utilisateurs</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="w-3/4 h-2 bg-[#0d4a70] rounded-full"></div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">PACA</div>
            <div className="text-sm text-gray-600 mb-2">198 utilisateurs</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="w-1/2 h-2 bg-[#13d090] rounded-full"></div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">Auvergne-Rhône-Alpes</div>
            <div className="text-sm text-gray-600 mb-2">156 utilisateurs</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="w-2/5 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Activité récente</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">+23 nouvelles inscriptions aujourd'hui</p>
              <p className="text-xs text-gray-500">15 jurys, 8 centres</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 1h</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">42 nouvelles mises en relation cette semaine</p>
              <p className="text-xs text-gray-500">+18% par rapport à la semaine dernière</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 3h</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Note moyenne en hausse</p>
              <p className="text-xs text-gray-500">4.7/5 (+0.2 ce mois)</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 1j</span>
          </div>
        </div>
      </div>
    </section>
  );
}
