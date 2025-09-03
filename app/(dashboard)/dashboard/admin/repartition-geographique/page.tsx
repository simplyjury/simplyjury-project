'use client';

import { MapPin, Users, Building2, BarChart3, Download } from 'lucide-react';

export default function RepartitionGeographiquePage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Répartition géographique</h1>
        <p className="text-gray-600">Analyse de la distribution des utilisateurs par région</p>
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
          <Download className="w-4 h-4" />
          Exporter les données géographiques
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Carte de France interactive</h3>
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Carte interactive</p>
            <p className="text-sm">Visualisation de la répartition des utilisateurs par région</p>
          </div>
        </div>
      </div>

      {/* Regional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Regions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Top 5 des régions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0d4a70] rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <div className="font-medium">Île-de-France</div>
                  <div className="text-sm text-gray-600">342 utilisateurs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">27.4%</div>
                <div className="text-xs text-gray-500">du total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <div className="font-medium">Provence-Alpes-Côte d'Azur</div>
                  <div className="text-sm text-gray-600">198 utilisateurs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">15.9%</div>
                <div className="text-xs text-gray-500">du total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <div className="font-medium">Auvergne-Rhône-Alpes</div>
                  <div className="text-sm text-gray-600">156 utilisateurs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">12.5%</div>
                <div className="text-xs text-gray-500">du total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div>
                  <div className="font-medium">Nouvelle-Aquitaine</div>
                  <div className="text-sm text-gray-600">134 utilisateurs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">10.7%</div>
                <div className="text-xs text-gray-500">du total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                <div>
                  <div className="font-medium">Occitanie</div>
                  <div className="text-sm text-gray-600">123 utilisateurs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">9.9%</div>
                <div className="text-xs text-gray-500">du total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth by Region */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Croissance par région</h3>
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Hauts-de-France</span>
                <span className="text-green-600 font-semibold">+45%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-11/12 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">89 nouveaux utilisateurs ce mois</div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Grand Est</span>
                <span className="text-green-600 font-semibold">+32%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">67 nouveaux utilisateurs ce mois</div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Bretagne</span>
                <span className="text-green-600 font-semibold">+28%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-2/3 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">45 nouveaux utilisateurs ce mois</div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Pays de la Loire</span>
                <span className="text-yellow-600 font-semibold">+12%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-1/3 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">23 nouveaux utilisateurs ce mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Regional Data */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Données détaillées par région</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurys
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Croissance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  Île-de-France
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    245
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    97
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  342
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-green-600 font-semibold">+15%</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  Provence-Alpes-Côte d'Azur
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    142
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    56
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  198
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-green-600 font-semibold">+22%</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  Auvergne-Rhône-Alpes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    112
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    44
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  156
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-green-600 font-semibold">+18%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
