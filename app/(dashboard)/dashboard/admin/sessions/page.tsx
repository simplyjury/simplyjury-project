'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Eye, Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle, MoreVertical, Info, X } from 'lucide-react';
import useSWR from 'swr';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5); // Extract HH:MM from HH:MM:SS
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800', 
        dotColor: 'bg-yellow-500',
        icon: AlertCircle 
      };
    case 'accepted':
      return { 
        label: 'Acceptée', 
        color: 'bg-green-100 text-green-800', 
        dotColor: 'bg-green-500',
        icon: CheckCircle 
      };
    case 'declined':
      return { 
        label: 'Refusée', 
        color: 'bg-red-100 text-red-800', 
        dotColor: 'bg-red-500',
        icon: XCircle 
      };
    case 'completed':
      return { 
        label: 'Terminée', 
        color: 'bg-blue-100 text-blue-800', 
        dotColor: 'bg-blue-500',
        icon: CheckCircle 
      };
    case 'cancelled':
      return { 
        label: 'Annulée', 
        color: 'bg-gray-100 text-gray-800', 
        dotColor: 'bg-gray-500',
        icon: XCircle 
      };
    default:
      return { 
        label: 'Inconnu', 
        color: 'bg-gray-100 text-gray-800', 
        dotColor: 'bg-gray-500',
        icon: AlertCircle 
      };
  }
};

const getModalityInfo = (modality: string) => {
  switch (modality) {
    case 'presentiel':
      return { label: 'Présentiel', color: 'bg-blue-100 text-blue-800' };
    case 'visio':
      return { label: 'Visio', color: 'bg-purple-100 text-purple-800' };
    case 'hybride':
      return { label: 'Hybride', color: 'bg-green-100 text-green-800' };
    default:
      return { label: 'Non spécifié', color: 'bg-gray-100 text-gray-800' };
  }
};

export default function AdminSessionsPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Pagination and filters state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedModality, setSelectedModality] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Build API URL with filters
  const getSessionsUrl = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12',
    });
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedStatus) params.append('status', selectedStatus);
    if (selectedModality) params.append('modality', selectedModality);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    return `/api/admin/sessions?${params.toString()}`;
  };
  
  const { data: sessionsData, error: sessionsError, isLoading: sessionsLoading } = useSWR(
    isAuthorized ? getSessionsUrl() : null,
    fetcher
  );

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || userLoading || !isAuthorized) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-600 mb-2">
              Vérification des autorisations...
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
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Gestion des sessions</h1>
        <p className="text-gray-600">Gérez toutes les sessions de jury de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par centre, jury, certification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="declined">Refusées</option>
              <option value="completed">Terminées</option>
            </select>
            <select 
              value={selectedModality}
              onChange={(e) => {
                setSelectedModality(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
            >
              <option value="">Toutes les modalités</option>
              <option value="presentiel">Présentiel</option>
              <option value="visio">Visio</option>
              <option value="hybride">Hybride</option>
            </select>
            <DateRangePicker
              startDate={dateFrom}
              endDate={dateTo}
              onDateChange={(start, end) => {
                setDateFrom(start);
                setDateTo(end);
                setCurrentPage(1);
              }}
              placeholder="Période"
              className="min-w-[200px]"
            />
            <button 
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setSelectedStatus('');
                setSelectedModality('');
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Effacer
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table/Cards */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Liste des sessions</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centre / Jury</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessionsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-300 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-300 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-300 rounded"></div></td>
                  </tr>
                ))
              ) : sessionsData?.sessions?.length > 0 ? (
                sessionsData.sessions.map((session: any) => {
                  const statusInfo = getStatusInfo(session.status);
                  const modalityInfo = getModalityInfo(session.modality);
                  
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {session.certification_title || 'Certification non spécifiée'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.candidate_count} candidat{session.candidate_count > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{session.training_center_name}</div>
                        <div className="text-sm text-gray-500">{session.jury_first_name} {session.jury_last_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.session_date)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(session.session_start_time)} - {formatTime(session.session_end_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs ${modalityInfo.color} rounded-full`}>
                          {modalityInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                          <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedSession(session);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {sessionsError ? 'Erreur lors du chargement des sessions' : 'Aucune session trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {sessionsLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sessionsData?.sessions?.length > 0 ? (
            <div className="p-4 space-y-4">
              {sessionsData.sessions.map((session: any) => {
                const statusInfo = getStatusInfo(session.status);
                const modalityInfo = getModalityInfo(session.modality);
                
                return (
                  <div 
                    key={session.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedSession(session);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {session.certification_title || 'Certification non spécifiée'}
                        </h4>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <Users className="w-3 h-3" />
                          {session.candidate_count} candidat{session.candidate_count > 1 ? 's' : ''}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Centre:</span>
                        <span className="text-xs font-medium text-gray-900">{session.training_center_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Jury:</span>
                        <span className="text-xs font-medium text-gray-900">{session.jury_first_name} {session.jury_last_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Date:</span>
                        <span className="text-xs font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.session_date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Horaires:</span>
                        <span className="text-xs font-medium text-gray-900 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(session.session_start_time)} - {formatTime(session.session_end_time)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs ${modalityInfo.color} rounded-full`}>
                        {modalityInfo.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                        <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {sessionsError ? 'Erreur lors du chargement des sessions' : 'Aucune session trouvée'}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {sessionsData?.pagination ? (
                `Affichage de ${((sessionsData.pagination.currentPage - 1) * sessionsData.pagination.limit) + 1} à ${Math.min(sessionsData.pagination.currentPage * sessionsData.pagination.limit, sessionsData.pagination.totalCount)} sur ${sessionsData.pagination.totalCount} sessions`
              ) : (
                'Chargement...'
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!sessionsData?.pagination?.hasPreviousPage || sessionsLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {/* Smart Page numbers */}
              {sessionsData?.pagination && sessionsData.pagination.totalPages > 1 && (
                <div className="flex gap-1">
                  {(() => {
                    const { currentPage, totalPages } = sessionsData.pagination;
                    const pages = [];
                    
                    // Always show first page
                    if (currentPage > 3) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      
                      // Add ellipsis if there's a gap
                      if (currentPage > 4) {
                        pages.push(
                          <span key="ellipsis-start" className="px-2 py-1 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Show pages around current page
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      const isCurrentPage = i === currentPage;
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-1 text-sm rounded ${
                            isCurrentPage 
                              ? 'bg-[#0d4a70] text-white' 
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Always show last page
                    if (currentPage < totalPages - 2) {
                      // Add ellipsis if there's a gap
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <span key="ellipsis-end" className="px-2 py-1 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === totalPages
                              ? 'bg-[#0d4a70] text-white' 
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
              )}
              
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!sessionsData?.pagination?.hasNextPage || sessionsLoading}
                className="px-3 py-1 text-sm bg-[#0d4a70] text-white rounded hover:bg-[#0a3a5a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {isModalOpen && selectedSession && (
        <SessionDetailsModal 
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSession(null);
          }}
        />
      )}
    </section>
  );
}

// Session Details Modal Component
function SessionDetailsModal({ session, isOpen, onClose }: { session: any; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const statusInfo = getStatusInfo(session.status);
  const modalityInfo = getModalityInfo(session.modality);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    #{session.id} - {session.certification_title || 'Autre certification'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {session.training_center_name} • {session.jury_first_name} {session.jury_last_name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{formatDate(session.session_date)}</span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
            {/* Training Center and Jury Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Training Center */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Centre de formation</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{session.training_center_name}</span>
                  </div>
                  {session.training_center_city && (
                    <div className="text-gray-600">{session.training_center_city}</div>
                  )}
                  {session.training_center_email && (
                    <div className="text-gray-600">{session.training_center_email}</div>
                  )}
                  {session.training_center_phone && (
                    <div className="text-gray-600">{session.training_center_phone}</div>
                  )}
                  {session.session_location && (
                    <div className="text-gray-600">{session.session_location}</div>
                  )}
                </div>
              </div>

              {/* Jury */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Jury</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{session.jury_first_name} {session.jury_last_name}</span>
                  </div>
                  {session.jury_region && (
                    <div className="text-gray-600">{session.jury_region}</div>
                  )}
                  {session.jury_email && (
                    <div className="text-gray-600">{session.jury_email}</div>
                  )}
                  {session.jury_phone && (
                    <div className="text-gray-600">{session.jury_phone}</div>
                  )}
                  {session.jury_profession && (
                    <div className="text-gray-600">{session.jury_profession}</div>
                  )}
                  {session.jury_experience && (
                    <div className="text-gray-600">{session.jury_experience} ans d'expérience</div>
                  )}
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Détails de la session</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Candidats:</span>
                  <div className="font-medium text-gray-900">{session.candidate_count}</div>
                </div>
                
                <div>
                  <span className="text-gray-500">Heure début:</span>
                  <div className="font-medium text-gray-900">{formatTime(session.session_start_time)}</div>
                </div>
                
                <div>
                  <span className="text-gray-500">Heure fin:</span>
                  <div className="font-medium text-gray-900">{formatTime(session.session_end_time)}</div>
                </div>
                
                {session.session_location && (
                  <div>
                    <span className="text-gray-500">Lieu:</span>
                    <div className="font-medium text-gray-900 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {session.session_location}
                    </div>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500">Transport:</span>
                  <div className="font-medium text-gray-900">
                    {session.transport_covered ? 'Pris en charge' : 'Non pris en charge'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Repas:</span>
                  <div className="font-medium text-gray-900">
                    {session.meals_covered ? 'Pris en charge' : 'Non pris en charge'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Hébergement:</span>
                  <div className="font-medium text-gray-900">
                    {session.accommodation_covered ? 'Pris en charge' : 'Non pris en charge'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Modalité:</span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs ${modalityInfo.color} rounded-full`}>
                      {modalityInfo.label}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Statut:</span>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                      <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            {session.custom_message && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Message du centre</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {session.custom_message}
                </div>
              </div>
            )}

            {/* Jury Response */}
            {session.jury_response && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Réponse du jury</h4>
                  {session.jury_response_date && (
                    <span className="text-sm text-gray-500">
                      • {formatDate(session.jury_response_date)}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {session.jury_response}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span>Créé le:</span>
                  <div className="font-medium">{new Date(session.created_at).toLocaleString('fr-FR')}</div>
                </div>
                {session.updated_at && session.updated_at !== session.created_at && (
                  <div>
                    <span>Modifié le:</span>
                    <div className="font-medium">{new Date(session.updated_at).toLocaleString('fr-FR')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
