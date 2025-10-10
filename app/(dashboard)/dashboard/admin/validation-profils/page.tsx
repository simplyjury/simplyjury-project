'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, CheckCircle, XCircle, User, Clock, MapPin, Briefcase, Shield } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { ValidationConfirmationModal } from '@/components/admin/validation-confirmation-modal';
import { JuryProfileDetailsModal } from '@/components/admin/jury-profile-details-modal';

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

interface PendingCertification {
  id: number;
  type: 'certification';
  title: string;
  code: string;
  level: string;
  centerName: string;
  centerCity: string;
  centerRegion: string;
  centerEmail: string;
  certificateurName: string;
  certificateurSiret: string;
  centerSiret: string;
  siretMismatch: boolean;
  createdAt: string;
  isUrgent: boolean;
  timeAgo: string;
}

interface ValidationStats {
  pending: number;
  pendingProfiles: number;
  pendingCertifications: number;
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
    itemType?: 'profile' | 'certification';
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileDetailsModal, setProfileDetailsModal] = useState<{
    isOpen: boolean;
    profile: any | null;
  }>({ isOpen: false, profile: null });

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
  const pendingCertifications: PendingCertification[] = validationData?.certifications || [];
  const stats: ValidationStats = validationData?.stats || {
    pending: 0,
    pendingProfiles: 0,
    pendingCertifications: 0,
    validatedThisMonth: 0,
    rejectedThisMonth: 0,
    urgent: 0
  };

  // Handle validation actions
  const handleValidationAction = (action: 'validate' | 'reject', userId: number, userName: string, itemType: 'profile' | 'certification' = 'profile') => {
    setModalState({
      isOpen: true,
      action,
      userId,
      userName,
      itemType
    });
  };

  const handleConfirmValidation = async (comment?: string) => {
    if (!modalState) return;

    setIsUpdating(true);
    try {
      const isCertification = modalState.itemType === 'certification';
      const endpoint = isCertification 
        ? `/api/admin/certifications/${modalState.userId}`
        : `/api/admin/validation-profils/${modalState.userId}`;
      
      const body = isCertification
        ? {
            approvalStatus: modalState.action === 'validate' ? 'approved' : 'rejected',
            approvalComment: comment,
          }
        : {
            validationStatus: modalState.action === 'validate' ? 'validated' : 'rejected',
            validationComment: comment,
          };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

  // Handle profile details modal
  const handleViewProfile = async (profile: any) => {
    try {
      // Fetch full profile details from API
      const response = await fetch(`/api/profile/jury/${profile.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile details');
      }
      const profileData = await response.json();
      
      // Combine user data with profile data
      const fullProfile = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profileData.data?.phone,
        profilePhotoUrl: profile.profilePhotoUrl,
        city: profile.city,
        region: profile.region,
        currentPosition: profile.currentPosition,
        currentCompany: profileData.data?.currentCompany,
        experienceYears: profile.experienceYears,
        hourlyRate: profile.hourlyRate,
        bio: profileData.data?.bio,
        expertiseDomains: profile.expertiseDomains,
        certifications: profileData.data?.certifications,
        workModalities: profileData.data?.workModalities,
        interventionZones: profileData.data?.interventionZones,
        availabilityPreferences: profileData.data?.availabilityPreferences,
        createdAt: profile.createdAt
      };
      
      setProfileDetailsModal({ isOpen: true, profile: fullProfile });
    } catch (error) {
      console.error('Error fetching profile details:', error);
      // Fallback to basic profile data
      setProfileDetailsModal({ isOpen: true, profile });
    }
  };

  const handleCloseProfileModal = () => {
    setProfileDetailsModal({ isOpen: false, profile: null });
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
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Tâches à valider</h1>
        <p className="text-gray-600">Gérez les demandes de validation des profils et certifications</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total en attente</div>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-3 sm:p-4 bg-blue-50">
          <div className="text-xl sm:text-2xl font-bold text-blue-900">{stats.pendingProfiles}</div>
          <div className="text-xs sm:text-sm text-blue-700">Profils</div>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-3 sm:p-4 bg-purple-50">
          <div className="text-xl sm:text-2xl font-bold text-purple-900">{stats.pendingCertifications}</div>
          <div className="text-xs sm:text-sm text-purple-700">Certifications</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.validatedThisMonth}</div>
          <div className="text-xs sm:text-sm text-gray-600">Validés ce mois</div>
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
            <h3 className="text-lg font-semibold text-[#0d4a70]">Tâches en attente de validation</h3>
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
              <p className="text-gray-600 text-sm">Chargement des tâches...</p>
            </div>
          ) : validationError ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-red-600 text-sm">Erreur lors du chargement des tâches</p>
            </div>
          ) : (pendingUsers && pendingUsers.length > 0) || (pendingCertifications && pendingCertifications.length > 0) ? (
            <>
              {/* Render Profiles */}
              {pendingUsers.map((profile: any) => (
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
                          <h4 
                            className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:text-[#13d090] transition-colors"
                            onClick={() => handleViewProfile(profile)}
                          >
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
                    <button 
                      onClick={() => handleViewProfile(profile)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0" 
                      title="Voir le profil"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              ))}
              
              {/* Render Certifications */}
              {pendingCertifications.map((cert) => (
                <div key={`cert-${cert.id}`} className="p-4 sm:p-6 hover:bg-gray-50 bg-purple-50/30">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#13d090] focus:ring-[#13d090] flex-shrink-0" />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-2xl">📜</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {cert.title}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Certification
                            </span>
                            {cert.isUrgent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                              <span className="font-medium">Code: {cert.code}</span>
                              <span>Niveau: {cert.level}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-gray-700">Centre: {cert.centerName}</span>
                              <span>{cert.centerCity}, {cert.centerRegion}</span>
                            </div>
                            {cert.siretMismatch && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <p className="font-semibold text-yellow-900">⚠️ SIRET non concordant</p>
                                <p className="text-yellow-800 mt-1">
                                  Certificateur: {cert.certificateurName} ({cert.certificateurSiret})
                                </p>
                                <p className="text-yellow-800">
                                  Centre: {cert.centerSiret}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2 sm:ml-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <button 
                        onClick={() => handleValidationAction('validate', cert.id, cert.title, 'certification')}
                        disabled={isUpdating}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Approuver la certification"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => handleValidationAction('reject', cert.id, cert.title, 'certification')}
                        disabled={isUpdating}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Rejeter la certification"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-600 text-sm">Aucune tâche en attente de validation</p>
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
          itemType={modalState.itemType}
        />
      )}

      {/* Jury Profile Details Modal */}
      <JuryProfileDetailsModal
        isOpen={profileDetailsModal.isOpen}
        onClose={handleCloseProfileModal}
        profile={profileDetailsModal.profile}
      />
    </section>
  );
}
