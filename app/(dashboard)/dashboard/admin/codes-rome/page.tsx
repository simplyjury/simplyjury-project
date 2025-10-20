'use client';

import { Database, RefreshCw, CheckCircle, AlertCircle, Calendar, FileJson, Download, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CodesRomePage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('');
  const [romeData, setRomeData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authorization check
  useEffect(() => {
    if (!mounted || userLoading) return;
    
    if (userError || !user) {
      router.push('/sign-in');
      return;
    }

    if (user.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, userError, userLoading, router, mounted]);

  // Load current ROME data info
  useEffect(() => {
    if (!isAuthorized) return;
    
    const loadRomeData = async () => {
      try {
        const response = await fetch('/api/admin/rome-codes/info');
        if (response.ok) {
          const data = await response.json();
          setRomeData(data);
        }
      } catch (error) {
        console.error('Error loading ROME data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadRomeData();
  }, [isAuthorized]);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/rome/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateStatus('idle');
    setUpdateMessage('');

    try {
      // Use AbortController for custom timeout (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

      const response = await fetch('/api/admin/rome-codes/update', {
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setUpdateStatus('success');
        setUpdateMessage(`✅ Mise à jour réussie ! ${data.totalCodes} codes ROME importés.`);
        
        // Reload data
        const infoResponse = await fetch('/api/admin/rome-codes/info');
        if (infoResponse.ok) {
          const newData = await infoResponse.json();
          setRomeData(newData);
        }
      } else {
        setUpdateStatus('error');
        setUpdateMessage(`❌ Erreur: ${data.error || 'Une erreur est survenue'}`);
      }
    } catch (error: any) {
      setUpdateStatus('error');
      
      // Handle abort/timeout error
      if (error.name === 'AbortError') {
        setUpdateMessage('❌ Délai d\'attente dépassé. L\'opération peut avoir réussi, veuillez rafraîchir la page.');
      } else {
        setUpdateMessage('❌ Erreur de connexion au serveur');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || userLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Codes ROME</h1>
          </div>
          <p className="text-gray-600">
            Gestion des codes ROME (Répertoire Opérationnel des Métiers et des Emplois)
          </p>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            État actuel
          </h2>

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : romeData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total codes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {romeData.totalCodes?.toLocaleString() || '0'}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Version</div>
                <div className="text-lg font-semibold text-green-600">
                  {romeData.version || 'N/A'}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Dernière mise à jour
                </div>
                <div className="text-sm font-medium text-purple-600">
                  {formatDate(romeData.lastUpdated)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
              <p>Aucune donnée ROME disponible</p>
              <p className="text-sm">Cliquez sur "Mettre à jour" pour importer les codes</p>
            </div>
          )}
        </div>

        {/* Source Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Source officielle
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Les codes ROME sont téléchargés depuis le portail Open Data de France Travail (data.gouv.fr)
          </p>
          <a 
            href="https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Voir la source officielle →
          </a>
        </div>

        {/* Update Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            Mise à jour
          </h2>

          <p className="text-gray-600 mb-4">
            Télécharge et importe les derniers codes ROME depuis France Travail Open Data.
            Cette opération peut prendre quelques secondes.
          </p>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium
              transition-colors duration-200
              ${updating 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Mise à jour en cours...' : 'Mettre à jour les codes ROME'}
          </button>

          {/* Status Message */}
          {updateStatus !== 'idle' && (
            <div className={`
              mt-4 p-4 rounded-lg flex items-start gap-3
              ${updateStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
            `}>
              {updateStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${updateStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {updateMessage}
              </p>
            </div>
          )}
        </div>

        {/* Search ROME Codes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Rechercher un code ROME
          </h2>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un métier (ex: développeur, coiffeur, comptable...)"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Recherche en cours...</p>
            </div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="mt-4 text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun code ROME trouvé pour "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-mono font-semibold rounded">
                        {code.code}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{code.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Catégorie: {code.categoryCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!searchQuery && (
            <div className="mt-4 text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 Utilisez la recherche floue pour trouver des codes ROME. La recherche fonctionne avec ou sans accents, 
              au masculin ou féminin, et trouve les résultats même avec des mots partiels.
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Informations</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Les codes ROME sont utilisés pour la recherche de jurys par domaine d'expertise</li>
            <li>• La mise à jour est recommandée tous les 3 mois</li>
            <li>• Les données sont stockées localement dans un fichier JSON</li>
            <li>• Aucune donnée utilisateur n'est affectée par cette opération</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
