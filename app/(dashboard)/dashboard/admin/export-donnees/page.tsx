'use client';

import { Download, FileText, Calendar, Users, Building2, BarChart3, Database } from 'lucide-react';

export default function ExportDonneesPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Export données</h1>
        <p className="text-gray-600">Exportez les données de la plateforme dans différents formats</p>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0d4a70]">Utilisateurs</h3>
              <p className="text-sm text-gray-600">1,247 utilisateurs</p>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FileText className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0d4a70]">Centres</h3>
              <p className="text-sm text-gray-600">156 centres</p>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FileText className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0d4a70]">Statistiques</h3>
              <p className="text-sm text-gray-600">Données complètes</p>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FileText className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Custom Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Export personnalisé</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Données à exporter</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm">Profils jurys</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm">Profils centres</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                <span className="text-sm">Mises en relation</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                <span className="text-sm">Avis et évaluations</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                <span className="text-sm">Statistiques d'usage</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Période</label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Format d'export</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
                  <option value="csv">CSV</option>
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]">
            <Download className="w-4 h-4" />
            Générer l'export personnalisé
          </button>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Exports récents</h3>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Export utilisateurs complet</h4>
                <p className="text-sm text-gray-600">1,247 utilisateurs • Format Excel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Il y a 2h</span>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Statistiques mensuelles</h4>
                <p className="text-sm text-gray-600">Données de septembre 2024 • Format CSV</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Il y a 1j</span>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sauvegarde complète</h4>
                <p className="text-sm text-gray-600">Toutes les données • Format JSON</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Il y a 3j</span>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
