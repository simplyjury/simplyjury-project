'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, UserPlus, Edit, Trash2, Shield, User, Building2, MoreVertical, Info, Eye, X, Phone, Mail, MapPin, Calendar, Briefcase, DollarSign, Clock, Award, Users, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper functions
const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

const getAvatarColor = (userType: string) => {
  switch (userType) {
    case 'admin': return 'bg-red-500';
    case 'jury': return 'bg-purple-500';
    case 'centre': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const formatLastLogin = (lastLogin: string | null) => {
  if (!lastLogin) return 'Jamais connecté';
  
  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffInMinutes = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes}min`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours}h`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Il y a ${days}j`;
  }
};

const getStatusInfo = (user: any) => {
  if (user.deletedAt) {
    return { label: 'Utilisateur désactivé', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' };
  }
  if (user.validationStatus === 'validated') {
    return { label: 'Actif', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' };
  }
  if (user.validationStatus === 'pending') {
    return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' };
  }
  if (user.validationStatus === 'rejected') {
    return { label: 'Rejeté', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' };
  }
  return { label: 'Inactif', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-500' };
};

const getUserTypeInfo = (userType: string) => {
  switch (userType) {
    case 'admin':
      return { label: 'Admin', color: 'bg-red-100 text-red-800', icon: Shield };
    case 'jury':
      return { label: 'Jury', color: 'bg-blue-100 text-blue-800', icon: User };
    case 'centre':
      return { label: 'Centre', color: 'bg-green-100 text-green-800', icon: Building2 };
    default:
      return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: User };
  }
};

export default function GestionUtilisateursPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const { data: userStats, error: statsError, isLoading: statsLoading } = useSWR('/api/admin/user-stats', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Pagination and filters state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Sort state
  const [sortBy, setSortBy] = useState<'name' | 'userType' | 'validationStatus' | 'lastLogin' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Deactivation modal state
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Reactivation modal state
  const [isReactivationModalOpen, setIsReactivationModalOpen] = useState(false);
  const [userToReactivate, setUserToReactivate] = useState<any>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1); // Reset to first page when search changes
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Build API URL with filters
  const getUsersUrl = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12',
    });
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedUserType) params.append('userType', selectedUserType);
    if (selectedStatus) params.append('status', selectedStatus);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortBy) params.append('sortOrder', sortOrder);
    return `/api/admin/users?${params.toString()}`;
  };
  
  const { data: usersData, error: usersError, isLoading: usersLoading, mutate: mutateUsers } = useSWR(
    isAuthorized ? getUsersUrl() : null,
    fetcher
  );

  // Handle user deactivation
  const handleDeactivateUser = async () => {
    if (!userToDeactivate || !confirmationText) return;

    setIsDeactivating(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDeactivate.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmationText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate user');
      }

      // Close modal and reset state
      setIsDeactivationModalOpen(false);
      setUserToDeactivate(null);
      setConfirmationText('');
      
      // Refresh users list
      mutateUsers();
      
      // Show success message (you can implement a toast notification here)
      alert('Utilisateur désactivé avec succès');

    } catch (error) {
      console.error('Error deactivating user:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la désactivation');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Handle user reactivation
  const handleReactivateUser = async () => {
    if (!userToReactivate) return;

    setIsReactivating(true);
    try {
      const response = await fetch(`/api/admin/users/${userToReactivate.id}/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate user');
      }

      // Close modal and reset state
      setIsReactivationModalOpen(false);
      setUserToReactivate(null);
      
      // Refresh users list
      mutateUsers();
      
      // Show success message
      alert('Utilisateur réactivé avec succès');

    } catch (error) {
      console.error('Error reactivating user:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la réactivation');
    } finally {
      setIsReactivating(false);
    }
  };

  // Handle client-side mounting to prevent hydration issues
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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

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
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Gestion utilisateurs</h1>
        <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedUserType}
              onChange={(e) => {
                setSelectedUserType(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="admin">Administrateurs</option>
              <option value="jury">Jurys</option>
              <option value="centre">Centres</option>
            </select>
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Désactivés</option>
            </select>
            <button 
              onClick={() => {
                // Clear all filters
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setSelectedUserType('');
                setSelectedStatus('');
                setSortBy('');
                setSortOrder('asc');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                searchTerm || selectedUserType || selectedStatus || sortBy
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {searchTerm || selectedUserType || selectedStatus || sortBy ? 'Effacer filtres' : 'Filtres'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(searchTerm || selectedUserType || selectedStatus || sortBy) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtres actifs:</span>
              <div className="flex gap-2">
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Recherche: "{searchTerm}"
                  </span>
                )}
                {selectedUserType && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Type: {selectedUserType === 'admin' ? 'Administrateurs' : selectedUserType === 'jury' ? 'Jurys' : 'Centres'}
                  </span>
                )}
                {selectedStatus && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Statut: {selectedStatus === 'active' ? 'Actifs' : selectedStatus === 'pending' ? 'En attente' : 'Désactivés'}
                  </span>
                )}
                {sortBy && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Tri: {sortBy === 'name' ? 'Nom' : sortBy === 'userType' ? 'Type' : sortBy === 'validationStatus' ? 'Statut' : 'Dernière connexion'} ({sortOrder === 'asc' ? 'Croissant' : 'Décroissant'})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setSelectedUserType('');
                setSelectedStatus('');
                setSortBy('');
                setSortOrder('asc');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {statsLoading ? '...' : userStats?.totalUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Total utilisateurs</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : userStats?.activeUsers || 0}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Actifs</span>
            <div className="group relative">
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Connectés dans les 30 derniers jours
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? '...' : userStats?.pendingUsers || 0}
          </div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {statsLoading ? '...' : userStats?.suspendedUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Suspendus</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Liste des utilisateurs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                    setCurrentPage(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Utilisateur</span>
                    {sortBy === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'userType') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('userType');
                      setSortOrder('asc');
                    }
                    setCurrentPage(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Type</span>
                    {sortBy === 'userType' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'validationStatus') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('validationStatus');
                      setSortOrder('asc');
                    }
                    setCurrentPage(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Statut</span>
                    {sortBy === 'validationStatus' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'lastLogin') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('lastLogin');
                      setSortOrder('asc');
                    }
                    setCurrentPage(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Dernière connexion</span>
                    {sortBy === 'lastLogin' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50 animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-48"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : usersData?.users?.length > 0 ? (
                usersData.users.map((userData: any) => {
                  const userTypeInfo = getUserTypeInfo(userData.userType);
                  const statusInfo = getStatusInfo(userData);
                  const IconComponent = userTypeInfo.icon;
                  
                  return (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10">
                            {(() => {
                              // Determine which photo to show based on user type
                              const profilePhotoUrl = userData.userType === 'jury' 
                                ? userData.juryPhotoUrl 
                                : userData.userType === 'centre' 
                                  ? userData.centerLogoUrl 
                                  : null;

                              if (profilePhotoUrl) {
                                return (
                                  <>
                                    <img
                                      src={profilePhotoUrl}
                                      alt={`${userData.name || 'User'} profile`}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                      onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        const container = target.parentElement;
                                        if (container) {
                                          target.style.display = 'none';
                                          const fallback = container.querySelector('.fallback-avatar') as HTMLElement;
                                          if (fallback) {
                                            fallback.style.display = 'flex';
                                          }
                                        }
                                      }}
                                    />
                                    <div 
                                      className={`fallback-avatar absolute inset-0 w-10 h-10 ${getAvatarColor(userData.userType)} rounded-full flex items-center justify-center text-white font-semibold hidden`}
                                    >
                                      {getInitials(userData.name, userData.email)}
                                    </div>
                                  </>
                                );
                              } else {
                                return (
                                  <div 
                                    className={`w-10 h-10 ${getAvatarColor(userData.userType)} rounded-full flex items-center justify-center text-white font-semibold`}
                                  >
                                    {getInitials(userData.name, userData.email)}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userData.name || 'Nom non renseigné'}
                            </div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${userTypeInfo.color} rounded-full`}>
                          <IconComponent className="w-3 h-3" />
                          {userTypeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                          <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastLogin(userData.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedUser(userData);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userData.userType !== 'admin' && !userData.deletedAt && (
                            <button 
                              onClick={() => {
                                setUserToDeactivate(userData);
                                setIsDeactivationModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Désactiver l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {userData.userType !== 'admin' && userData.deletedAt && (
                            <button 
                              onClick={() => {
                                setUserToReactivate(userData);
                                setIsReactivationModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Réactiver l'utilisateur"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {usersError ? 'Erreur lors du chargement des utilisateurs' : 'Aucun utilisateur trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {usersData?.pagination ? (
                `Affichage de ${((usersData.pagination.currentPage - 1) * usersData.pagination.limit) + 1} à ${Math.min(usersData.pagination.currentPage * usersData.pagination.limit, usersData.pagination.totalCount)} sur ${usersData.pagination.totalCount} utilisateurs`
              ) : (
                'Chargement...'
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!usersData?.pagination?.hasPreviousPage || usersLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {/* Smart Page numbers */}
              {usersData?.pagination && usersData.pagination.totalPages > 1 && (
                <div className="flex gap-1">
                  {(() => {
                    const { currentPage, totalPages } = usersData.pagination;
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
                disabled={!usersData?.pagination?.hasNextPage || usersLoading}
                className="px-3 py-1 text-sm bg-[#0d4a70] text-white rounded hover:bg-[#0a3a5a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailsModal 
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* User Deactivation Modal */}
      {isDeactivationModalOpen && userToDeactivate && (
        <UserDeactivationModal 
          user={userToDeactivate}
          isOpen={isDeactivationModalOpen}
          confirmationText={confirmationText}
          setConfirmationText={setConfirmationText}
          isDeactivating={isDeactivating}
          onConfirm={handleDeactivateUser}
          onClose={() => {
            setIsDeactivationModalOpen(false);
            setUserToDeactivate(null);
            setConfirmationText('');
          }}
        />
      )}

      {/* User Reactivation Modal */}
      {isReactivationModalOpen && userToReactivate && (
        <UserReactivationModal 
          user={userToReactivate}
          isOpen={isReactivationModalOpen}
          isReactivating={isReactivating}
          onConfirm={handleReactivateUser}
          onClose={() => {
            setIsReactivationModalOpen(false);
            setUserToReactivate(null);
          }}
        />
      )}
    </section>
  );
}

// User Details Modal Component
function UserDetailsModal({ user, isOpen, onClose }: { user: any; isOpen: boolean; onClose: () => void }) {
  const { data: userDetails, error, isLoading } = useSWR(
    isOpen && user ? `/api/admin/users/${user.id}` : null,
    fetcher
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative w-12 h-12">
                  {(() => {
                    const profilePhotoUrl = user.userType === 'jury' 
                      ? user.juryPhotoUrl 
                      : user.userType === 'centre' 
                        ? user.centerLogoUrl 
                        : null;

                    if (profilePhotoUrl) {
                      return (
                        <>
                          <img
                            src={profilePhotoUrl}
                            alt={`${user.name || 'User'} profile`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const container = target.parentElement;
                              if (container) {
                                target.style.display = 'none';
                                const fallback = container.querySelector('.fallback-avatar') as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }
                            }}
                          />
                          <div 
                            className={`fallback-avatar absolute inset-0 w-12 h-12 ${getAvatarColor(user.userType)} rounded-full flex items-center justify-center text-white font-semibold hidden`}
                          >
                            {getInitials(user.name, user.email)}
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div 
                          className={`w-12 h-12 ${getAvatarColor(user.userType)} rounded-full flex items-center justify-center text-white font-semibold`}
                        >
                          {getInitials(user.name, user.email)}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name || 'Nom non renseigné'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d4a70]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Erreur lors du chargement des détails</p>
              </div>
            ) : userDetails?.user ? (
              <UserDetailsContent user={userDetails.user} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// User Details Content Component
function UserDetailsContent({ user }: { user: any }) {
  const userTypeInfo = getUserTypeInfo(user.userType);
  const statusInfo = getStatusInfo(user);
  const IconComponent = userTypeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Informations générales
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${userTypeInfo.color} rounded-full`}>
                <IconComponent className="w-3 h-3" />
                {userTypeInfo.label}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Statut:</span>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${statusInfo.color} rounded-full`}>
                <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Email vérifié:</span>
            <p className="mt-1 font-medium">{user.emailVerified ? 'Oui' : 'Non'}</p>
          </div>
          <div>
            <span className="text-gray-500">Profil complété:</span>
            <p className="mt-1 font-medium">{user.profileCompleted ? 'Oui' : 'Non'}</p>
          </div>
          <div>
            <span className="text-gray-500">Dernière connexion:</span>
            <p className="mt-1 font-medium">{formatLastLogin(user.lastLogin)}</p>
          </div>
          <div>
            <span className="text-gray-500">Membre depuis:</span>
            <p className="mt-1 font-medium">
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Jury Profile Details */}
      {user.userType === 'jury' && (
        <JuryProfileDetails user={user} />
      )}

      {/* Training Center Details */}
      {user.userType === 'centre' && (
        <TrainingCenterDetails user={user} />
      )}
    </div>
  );
}

// Jury Profile Details Component
function JuryProfileDetails({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Informations personnelles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {user.juryFirstName && (
            <div>
              <span className="text-gray-500">Prénom:</span>
              <p className="mt-1 font-medium">{user.juryFirstName}</p>
            </div>
          )}
          {user.juryLastName && (
            <div>
              <span className="text-gray-500">Nom:</span>
              <p className="mt-1 font-medium">{user.juryLastName}</p>
            </div>
          )}
          {user.juryPhone && (
            <div>
              <span className="text-gray-500">Téléphone:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {user.juryPhone}
              </p>
            </div>
          )}
          {user.juryRegion && (
            <div>
              <span className="text-gray-500">Région:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.juryRegion}
              </p>
            </div>
          )}
          {user.juryCity && (
            <div>
              <span className="text-gray-500">Ville:</span>
              <p className="mt-1 font-medium">{user.juryCity}</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Informations professionnelles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {user.juryCurrentPosition && (
            <div>
              <span className="text-gray-500">Poste actuel:</span>
              <p className="mt-1 font-medium">{user.juryCurrentPosition}</p>
            </div>
          )}
          {user.juryCurrentCompany && (
            <div>
              <span className="text-gray-500">Entreprise:</span>
              <p className="mt-1 font-medium">{user.juryCurrentCompany}</p>
            </div>
          )}
          {user.juryExperienceYears && (
            <div>
              <span className="text-gray-500">Années d'expérience:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {user.juryExperienceYears} ans
              </p>
            </div>
          )}
          {user.juryHourlyRate && (
            <div>
              <span className="text-gray-500">Tarif horaire:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {user.juryHourlyRate}€/h
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expertise */}
      {user.juryExpertiseDomains && user.juryExpertiseDomains.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Domaines d'expertise
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.juryExpertiseDomains.map((domain: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {user.juryCertifications && user.juryCertifications.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.juryCertifications.map((cert: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {user.juryBio && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Biographie</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{user.juryBio}</p>
        </div>
      )}
    </div>
  );
}

// Training Center Details Component
function TrainingCenterDetails({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      {/* Center Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Informations du centre
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {user.centerName && (
            <div>
              <span className="text-gray-500">Nom:</span>
              <p className="mt-1 font-medium">{user.centerName}</p>
            </div>
          )}
          {user.centerSiret && (
            <div>
              <span className="text-gray-500">SIRET:</span>
              <p className="mt-1 font-medium">{user.centerSiret}</p>
            </div>
          )}
          {user.centerPhone && (
            <div>
              <span className="text-gray-500">Téléphone:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {user.centerPhone}
              </p>
            </div>
          )}
          {user.centerEmail && (
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="mt-1 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.centerEmail}
              </p>
            </div>
          )}
          {user.centerWebsite && (
            <div>
              <span className="text-gray-500">Site web:</span>
              <p className="mt-1 font-medium">
                <a href={user.centerWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {user.centerWebsite}
                </a>
              </p>
            </div>
          )}
          {user.centerSector && (
            <div>
              <span className="text-gray-500">Secteur:</span>
              <p className="mt-1 font-medium">{user.centerSector}</p>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      {(user.centerAddress || user.centerCity || user.centerPostalCode || user.centerRegion) && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Adresse
          </h4>
          <div className="text-sm space-y-1">
            {user.centerAddress && <p>{user.centerAddress}</p>}
            <p>
              {user.centerPostalCode && `${user.centerPostalCode} `}
              {user.centerCity}
            </p>
            {user.centerRegion && <p>{user.centerRegion}</p>}
          </div>
        </div>
      )}

      {/* Contact Person */}
      {(user.centerContactPersonName || user.centerContactPersonRole || user.centerContactPersonEmail || user.centerContactPersonPhone) && (
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Personne de contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {user.centerContactPersonName && (
              <div>
                <span className="text-gray-500">Nom:</span>
                <p className="mt-1 font-medium">{user.centerContactPersonName}</p>
              </div>
            )}
            {user.centerContactPersonRole && (
              <div>
                <span className="text-gray-500">Fonction:</span>
                <p className="mt-1 font-medium">{user.centerContactPersonRole}</p>
              </div>
            )}
            {user.centerContactPersonEmail && (
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="mt-1 font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.centerContactPersonEmail}
                </p>
              </div>
            )}
            {user.centerContactPersonPhone && (
              <div>
                <span className="text-gray-500">Téléphone:</span>
                <p className="mt-1 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {user.centerContactPersonPhone}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Certifications et qualifications
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Certificateur:</span>
            <p className="mt-1 font-medium">{user.centerIsCertificateur ? 'Oui' : 'Non'}</p>
          </div>
          <div>
            <span className="text-gray-500">Qualiopi:</span>
            <p className="mt-1 font-medium">{user.centerQualiopiCertified ? 'Certifié' : 'Non certifié'}</p>
          </div>
          {user.centerQualiopiStatus && (
            <div className="sm:col-span-2">
              <span className="text-gray-500">Statut Qualiopi:</span>
              <p className="mt-1 font-medium">{user.centerQualiopiStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {user.centerDescription && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Description</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{user.centerDescription}</p>
        </div>
      )}
    </div>
  );
}

// User Deactivation Modal Component
function UserDeactivationModal({ 
  user, 
  isOpen, 
  confirmationText, 
  setConfirmationText, 
  isDeactivating, 
  onConfirm, 
  onClose 
}: { 
  user: any; 
  isOpen: boolean; 
  confirmationText: string;
  setConfirmationText: (text: string) => void;
  isDeactivating: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const expectedText = `desactiver le user ${user.name || user.email}`;
  const isConfirmationValid = confirmationText.toLowerCase().trim() === expectedText.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="bg-red-50 border-b border-red-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Désactiver l'utilisateur
                  </h3>
                  <p className="text-sm text-red-700">Action irréversible</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="rounded-full p-2 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                disabled={isDeactivating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6">
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    {(() => {
                      const profilePhotoUrl = user.userType === 'jury' 
                        ? user.juryPhotoUrl 
                        : user.userType === 'centre' 
                          ? user.centerLogoUrl 
                          : null;

                      if (profilePhotoUrl) {
                        return (
                          <img
                            src={profilePhotoUrl}
                            alt={`${user.name || 'User'} profile`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        );
                      } else {
                        return (
                          <div 
                            className={`w-10 h-10 ${getAvatarColor(user.userType)} rounded-full flex items-center justify-center text-white font-semibold`}
                          >
                            {getInitials(user.name, user.email)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name || 'Nom non renseigné'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-yellow-600 mt-0.5">
                    ⚠️
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-2">Attention :</p>
                    <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                      <li>L'utilisateur sera désactivé (suppression logique)</li>
                      <li>Ses informations seront conservées dans la base de données</li>
                      <li>Il ne pourra plus accéder à son compte</li>
                      <li>Cette action peut être annulée par un administrateur</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pour confirmer, tapez exactement :
                </label>
                <div className="bg-gray-100 rounded p-2 text-sm font-mono text-gray-800">
                  {expectedText}
                </div>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez le texte de confirmation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isDeactivating}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600">
                    Le texte de confirmation ne correspond pas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isDeactivating}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={!isConfirmationValid || isDeactivating}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isDeactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Désactivation...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Désactiver l'utilisateur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Reactivation Modal Component
function UserReactivationModal({ 
  user, 
  isOpen, 
  isReactivating, 
  onConfirm, 
  onClose 
}: { 
  user: any; 
  isOpen: boolean; 
  isReactivating: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="bg-green-50 border-b border-green-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Réactiver l'utilisateur
                  </h3>
                  <p className="text-sm text-green-700">Restaurer l'accès au compte</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="rounded-full p-2 text-green-400 hover:text-green-600 hover:bg-green-100 transition-colors"
                disabled={isReactivating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6">
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    {(() => {
                      const profilePhotoUrl = user.userType === 'jury' 
                        ? user.juryPhotoUrl 
                        : user.userType === 'centre' 
                          ? user.centerLogoUrl 
                          : null;

                      if (profilePhotoUrl) {
                        return (
                          <img
                            src={profilePhotoUrl}
                            alt={`${user.name || 'User'} profile`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        );
                      } else {
                        return (
                          <div 
                            className={`w-10 h-10 ${getAvatarColor(user.userType)} rounded-full flex items-center justify-center text-white font-semibold`}
                          >
                            {getInitials(user.name, user.email)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name || 'Nom non renseigné'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-red-600 mt-1">Actuellement désactivé</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">
                    ℹ️
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-2">Confirmation :</p>
                    <ul className="text-blue-700 space-y-1 list-disc list-inside">
                      <li>L'utilisateur sera réactivé</li>
                      <li>Il pourra de nouveau accéder à son compte</li>
                      <li>Toutes ses données seront restaurées</li>
                      <li>Cette action peut être annulée en désactivant à nouveau</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isReactivating}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isReactivating}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isReactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Réactivation...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Réactiver l'utilisateur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
