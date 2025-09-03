'use client';

import { Search, Filter, CheckCircle, XCircle, User, Clock, MapPin, Briefcase } from 'lucide-react';

export default function ValidationProfilsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Validation profils</h1>
        <p className="text-gray-600">Gérez les demandes de validation des profils jurys et centres</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
              <option value="">Tous les types</option>
              <option value="jury">Jurys</option>
              <option value="center">Centres</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
              <option value="">Toutes les régions</option>
              <option value="ile-de-france">Île-de-France</option>
              <option value="paca">PACA</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-sm text-gray-600">Validés ce mois</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">8</div>
          <div className="text-sm text-gray-600">Refusés ce mois</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">3</div>
          <div className="text-sm text-gray-600">Urgents (&gt;48h)</div>
        </div>
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Profils en attente de validation</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                Valider sélectionnés
              </button>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                Refuser sélectionnés
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Profile Item 1 */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  MD
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">Marie Dubois</h4>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Jury</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Urgent
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Directrice Commerciale
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Nice, PACA
                    </span>
                    <span>15 ans d'expérience</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Management</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Commercial</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Formation</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Il y a 3h</span>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <User className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Item 2 */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  CF
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">Centre Formation Pro</h4>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Centre</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Lyon, Auvergne-Rhône-Alpes
                    </span>
                    <span>SIRET: 12345678901234</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Qualiopi</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Certificateur</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Il y a 1j</span>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <User className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="p-12 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucun autre profil en attente de validation</p>
          </div>
        </div>
      </div>
    </section>
  );
}
