'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Users, Building2, Database, Shield } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExportDonneesPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const { data: stats, isLoading: statsLoading } = useSWR('/api/admin/export-stats', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  
  // Custom export state
  const [customExport, setCustomExport] = useState({
    juryProfiles: true,
    centerProfiles: true,
    connections: false,
    reviews: false,
    startDate: '',
    endDate: '',
    format: 'csv' as 'csv' | 'excel',
  });

  const handleExport = async (type: 'users' | 'centers', format: 'csv' | 'excel') => {
    try {
      setIsExporting(`${type}-${format}`);
      const endpoint = type === 'users' ? '/api/admin/export-users' : '/api/admin/export-centers';
      const response = await fetch(`${endpoint}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_${type}_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xls'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleCustomExport = async () => {
    try {
      // Validate at least one data type is selected
      if (!customExport.juryProfiles && !customExport.centerProfiles && !customExport.connections && !customExport.reviews) {
        alert('Veuillez sélectionner au moins un type de données à exporter.');
        return;
      }

      setIsExporting('custom');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', customExport.format);
      if (customExport.juryProfiles) params.append('juryProfiles', 'true');
      if (customExport.centerProfiles) params.append('centerProfiles', 'true');
      if (customExport.connections) params.append('connections', 'true');
      if (customExport.reviews) params.append('reviews', 'true');
      if (customExport.startDate) params.append('startDate', customExport.startDate);
      if (customExport.endDate) params.append('endDate', customExport.endDate);

      const response = await fetch(`/api/admin/export-custom?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_personnalise_${new Date().toISOString().split('T')[0]}.${customExport.format === 'csv' ? 'csv' : 'xls'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Custom export error:', error);
      alert('Erreur lors de l\'export personnalisé. Veuillez réessayer.');
    } finally {
      setIsExporting(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Export données</h1>
        <p className="text-gray-600">Exportez les données de la plateforme dans différents formats</p>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0d4a70]">Utilisateurs</h3>
              <p className="text-sm text-gray-600">
                {statsLoading ? 'Chargement...' : `${stats?.totalUsers || 0} utilisateurs`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => handleExport('users', 'csv')}
              disabled={isExporting === 'users-csv'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting === 'users-csv' ? 'Export en cours...' : 'Export CSV'}
            </button>
            <button 
              onClick={() => handleExport('users', 'excel')}
              disabled={isExporting === 'users-excel'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {isExporting === 'users-excel' ? 'Export en cours...' : 'Export Excel'}
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
              <p className="text-sm text-gray-600">
                {statsLoading ? 'Chargement...' : `${stats?.totalCenters || 0} centres`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => handleExport('centers', 'csv')}
              disabled={isExporting === 'centers-csv'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting === 'centers-csv' ? 'Export en cours...' : 'Export CSV'}
            </button>
            <button 
              onClick={() => handleExport('centers', 'excel')}
              disabled={isExporting === 'centers-excel'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {isExporting === 'centers-excel' ? 'Export en cours...' : 'Export Excel'}
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
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#13d090] border-gray-300 rounded" 
                  checked={customExport.juryProfiles}
                  onChange={(e) => setCustomExport({ ...customExport, juryProfiles: e.target.checked })}
                />
                <span className="text-sm">Profils jurys</span>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#13d090] border-gray-300 rounded" 
                  checked={customExport.centerProfiles}
                  onChange={(e) => setCustomExport({ ...customExport, centerProfiles: e.target.checked })}
                />
                <span className="text-sm">Profils centres</span>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#13d090] border-gray-300 rounded" 
                  checked={customExport.connections}
                  onChange={(e) => setCustomExport({ ...customExport, connections: e.target.checked })}
                />
                <span className="text-sm">Sessions</span>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#13d090] border-gray-300 rounded" 
                  checked={customExport.reviews}
                  onChange={(e) => setCustomExport({ ...customExport, reviews: e.target.checked })}
                />
                <span className="text-sm">Avis et évaluations</span>
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
                    value={customExport.startDate}
                    onChange={(e) => setCustomExport({ ...customExport, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={customExport.endDate}
                    onChange={(e) => setCustomExport({ ...customExport, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Format d'export</label>
                <select 
                  value={customExport.format}
                  onChange={(e) => setCustomExport({ ...customExport, format: e.target.value as 'csv' | 'excel' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={handleCustomExport}
            disabled={isExporting === 'custom'}
            className="flex items-center gap-2 px-6 py-3 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting === 'custom' ? 'Export en cours...' : 'Générer l\'export personnalisé'}
          </button>
        </div>
      </div>
    </section>
  );
}
