'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Building2, BarChart3, Download, Shield } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RegionalStat {
  rank: number;
  region: string;
  count: number;
  percentage: string;
}

interface RegionalStatsResponse {
  success: boolean;
  data: RegionalStat[];
  total: number;
  type: string;
}

export default function RepartitionGeographiquePage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'centres' | 'juries'>('centres');
  
  // Fetch regional statistics based on active tab
  const { data: regionalStats, error: statsError, isLoading: statsLoading } = useSWR<RegionalStatsResponse>(
    isAuthorized ? `/api/admin/regional-stats?type=${activeTab}` : null,
    fetcher
  );

  useEffect(() => {
    if (userLoading) return;
    
    if (userError || !user) {
      router.push('/sign-in');
      return;
    }

    if (user.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, userError, userLoading, router]);

  // Show loading state while checking authorization
  if (userLoading || !isAuthorized) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-600 mb-2">
              Vérification des autorisations...
            </div>
            <div className="text-sm text-gray-500">
              Veuillez patienter pendant que nous vérifions vos droits d'accès.
            </div>
          </div>
        </div>
      </section>
    );
  }
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

      {/* Map Placeholder - V2 Feature */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Carte de France interactive</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            Fonctionnalité V2
          </span>
        </div>
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Carte interactive</p>
            <p className="text-sm mb-2">Visualisation de la répartition des utilisateurs par région</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 max-w-md mx-auto">
              <p className="text-xs text-blue-700 font-medium">
                Cette fonctionnalité sera disponible dans la version 2.0 de SimplyJury
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Regions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#0d4a70] mb-4">Top 5 des régions</h3>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('centres')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'centres'
                  ? 'bg-white text-[#0d4a70] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Centres de formation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('juries')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'juries'
                  ? 'bg-white text-[#0d4a70] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Jurys
              </div>
            </button>
          </div>

          {/* Regional Statistics */}
          <div className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Chargement des données...</div>
              </div>
            ) : statsError || !regionalStats?.success ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500">Erreur lors du chargement des données</div>
              </div>
            ) : regionalStats.data.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">
                  Aucune donnée disponible pour {activeTab === 'centres' ? 'les centres de formation' : 'les jurys'}
                </div>
              </div>
            ) : (
              regionalStats.data.map((region, index) => {
                const colors = ['bg-[#0d4a70]', 'bg-[#13d090]', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
                const bgColor = colors[index] || 'bg-gray-500';
                
                return (
                  <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                        {region.rank}
                      </div>
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-gray-600">
                          {region.count} {activeTab === 'centres' ? 'centres' : 'jurys'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{region.percentage}%</div>
                      <div className="text-xs text-gray-500">du total</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Growth by Region */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Croissance par région</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Fonctionnalité V2
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 font-medium">
              Données simulées - Cette fonctionnalité sera disponible dans la version 2.0
            </p>
          </div>
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

    </section>
  );
}
