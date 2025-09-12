'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, CheckCircle, XCircle, User, Clock, MapPin, Briefcase, Shield } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { ValidationConfirmationModal } from '@/components/admin/validation-confirmation-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PendingUser {
  id: number;
  name: string;
  email: string;
  userType: 'jury' | 'centre';
  validationStatus: string;
  createdAt: string;
  profilePhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  region?: string;
  hourlyRate?: number;
  experienceYears?: number;
  currentPosition?: string;
  expertiseDomains?: string[];
  centerName?: string;
  siret?: string;
  centerCity?: string;
  centerRegion?: string;
  isUrgent: boolean;
  timeAgo: string;
}

interface ValidationStats {
  pending: number;
  validatedThisMonth: number;
  rejectedThisMonth: number;
  urgent: number;
}

export default function ValidationProfilsPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'validate' | 'reject';
    userId: number;
    userName: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedType) params.append('type', selectedType);
    if (selectedRegion) params.append('region', selectedRegion);
    return `/api/admin/validation-profils?${params.toString()}`;
  };

  // Fetch pending users data
  const { data: validationData, error: validationError, isLoading: validationLoading } = useSWR(
    isAuthorized ? buildApiUrl() : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
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

  const pendingUsers: PendingUser[] = validationData?.users || [];
  const stats: ValidationStats = validationData?.stats || {
    pending: 0,
    validatedThisMonth: 0,
    rejectedThisMonth: 0,
    urgent: 0
  };

  // Handle validation actions
  const handleValidationAction = (action: 'validate' | 'reject', userId: number, userName: string) => {
    setModalState({
      isOpen: true,
      action,
      userId,
      userName
    });
  };

  const handleConfirmValidation = async (comment?: string) => {
    if (!modalState) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/validation-profils/${modalState.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationStatus: modalState.action === 'validate' ? 'validated' : 'rejected',
          validationComment: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      
      // Refresh the data
      mutate(buildApiUrl());
      mutate('/api/admin/pending-jury-count');
      
      // Close modal
      setModalState(null);
      
      // Show success message (you could add a toast notification here)
      console.log(result.message);
      
    } catch (error) {
      console.error('Error updating validation status:', error);
      // You could add error handling/toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseModal = () => {
    if (!isUpdating) {
      setModalState(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Validation profils</h1>
        <p className="text-gray-600">Gérez les demandes de validation des profils jurys et centres</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent text-sm"
              disabled
            >
              <option value="">Jurys seulement</option>
            </select>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent text-sm"
            >
              <option value="">Toutes les régions</option>
              <option value="Île-de-France">Île-de-France</option>
              <option value="PACA">PACA</option>
              <option value="Bretagne">Bretagne</option>
              <option value="Corse">Corse</option>
              <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:w-auto w-full">
              <Filter className="w-4 h-4" />
              <span className="sm:inline hidden">Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.validatedThisMonth}</div>
          <div className="text-xs sm:text-sm text-gray-600">Validés ce mois</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejectedThisMonth}</div>
          <div className="text-xs sm:text-sm text-gray-600">Refusés ce mois</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.urgent}</div>
          <div className="text-xs sm:text-sm text-gray-600 break-words">Urgents (&gt;48h)</div>
        </div>
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Profils en attente de validation</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 w-full sm:w-auto">
                Valider sélectionnés
              </button>
              <button className="px-3 py-2 text-xs sm:text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 w-full sm:w-auto">
                Refuser sélectionnés
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {validationLoading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13d090] mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Chargement des profils...</p>
            </div>
          ) : validationError ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-red-600 text-sm">Erreur lors du chargement des profils</p>
            </div>
          ) : pendingUsers && pendingUsers.length > 0 ? (
            pendingUsers.map((profile: any) => (
              <div key={profile.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#13d090] focus:ring-[#13d090] flex-shrink-0" />
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                      {profile.profilePhotoUrl ? (
                        <img 
                          src={profile.profilePhotoUrl} 
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-xs sm:text-sm font-medium">
                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {profile.firstName} {profile.lastName}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Jury
                          </span>
                          {profile.isUrgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="break-words">{profile.currentPosition}</span>
                            <span className="break-words">{profile.city}, {profile.region}</span>
                            <span className="whitespace-nowrap">{profile.experienceYears} ans d'expérience</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="break-words">{profile.expertiseDomains}</span>
                            <span className="whitespace-nowrap">Tarif: {profile.hourlyRate}€/h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end gap-2 sm:ml-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button 
                      onClick={() => handleValidationAction('validate', profile.id, `${profile.firstName} ${profile.lastName}`)}
                      disabled={isUpdating}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Valider le profil"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      onClick={() => handleValidationAction('reject', profile.id, `${profile.firstName} ${profile.lastName}`)}
                      disabled={isUpdating}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Refuser le profil"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0" title="Voir le profil">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-600 text-sm">Aucun profil en attente de validation</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Confirmation Modal */}
      {modalState && (
        <ValidationConfirmationModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmValidation}
          action={modalState.action}
          userName={modalState.userName}
          isLoading={isUpdating}
        />
      )}
    </section>
  );
}
