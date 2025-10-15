'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, Mail, TrendingUp, Calendar, Users, Trash2, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actif</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
    case 'unsubscribed':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Désinscrit</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
};

export default function AdminNewsletterPage() {
  const router = useRouter();
  const { data: user, error: userError, isLoading: userLoading } = useSWR('/api/user', fetcher);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Pagination and filters state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Sort state
  const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'status' | ''>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const limit = 8;

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
    });
    
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedStatus) params.append('status', selectedStatus);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortBy) params.append('sortOrder', sortOrder);
    
    return `/api/admin/newsletter-subscribers?${params.toString()}`;
  };

  const { data, error, isLoading, mutate } = useSWR(
    isAuthorized ? buildApiUrl() : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check authorization
  useEffect(() => {
    setMounted(true);
    
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

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/newsletter-subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        mutate();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedStatus) params.append('status', selectedStatus);
    
    window.open(`/api/admin/newsletter-subscribers/export?${params.toString()}`, '_blank');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedStatus;

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSubscribers.length} abonné(s) ?`)) {
      return;
    }

    try {
      const deletePromises = selectedSubscribers.map(id =>
        fetch('/api/admin/newsletter-subscribers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
      );

      await Promise.all(deletePromises);
      setSelectedSubscribers([]);
      mutate();
    } catch (error) {
      console.error('Error bulk deleting subscribers:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleBulkExport = async () => {
    if (selectedSubscribers.length === 0) return;

    try {
      // Get full subscriber data for selected IDs
      const selectedData = subscribers.filter((s: any) => selectedSubscribers.includes(s.id));
      
      // Create CSV content
      const headers = ['Email', 'Statut', 'Type utilisateur', 'Date d\'inscription', 'Date de confirmation', 'Date de désinscription'];
      const csvRows = [headers.join(',')];

      selectedData.forEach((sub: any) => {
        const row = [
          sub.email,
          sub.status,
          sub.userType || '',
          sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('fr-FR') : '',
          sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString('fr-FR') : '',
          sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString('fr-FR') : '',
        ];
        csvRows.push(row.join(','));
      });

      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-selection-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSelectedSubscribers([]);
    } catch (error) {
      console.error('Error exporting selected subscribers:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleBulkUnsubscribe = async () => {
    if (selectedSubscribers.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir désinscrire ${selectedSubscribers.length} abonné(s) ?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/newsletter-subscribers/bulk-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubscribers }),
      });

      if (response.ok) {
        setSelectedSubscribers([]);
        mutate();
      } else {
        alert('Erreur lors de la désinscription');
      }
    } catch (error) {
      console.error('Error bulk unsubscribing:', error);
      alert('Erreur lors de la désinscription');
    }
  };

  if (!mounted || userLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d4a70]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des données</p>
          {error && <p className="text-sm text-gray-600 mb-4">{error.message || JSON.stringify(error)}</p>}
          <Button onClick={() => mutate()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const { subscribers = [], pagination = { page: 1, limit: 8, total: 0, totalPages: 0 }, statistics = { totalSubscribers: 0, totalActive: 0, weeklySubscriptions: 0, monthlySubscriptions: 0, activeRate: 0 } } = data || {};

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Abonnés Newsletter</h1>
        <p className="text-gray-600">Gestion des inscriptions à la newsletter SimplyJury</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {statistics.totalSubscribers}
          </div>
          <div className="text-sm text-gray-600">Abonnés totaux</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            +{statistics.weeklySubscriptions}
          </div>
          <div className="text-sm text-gray-600">Cette semaine</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            +{statistics.monthlySubscriptions}
          </div>
          <div className="text-sm text-gray-600">Ce mois-ci</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {statistics.activeRate}%
          </div>
          <div className="text-sm text-gray-600">Taux d'actifs</div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSubscribers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedSubscribers.length} abonné(s) sélectionné(s)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubscribers([])}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Désélectionner tout
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
                Exporter la sélection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkUnsubscribe}
                className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <X className="h-4 w-4" />
                Désinscrire la sélection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer la sélection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrer
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-[#0d4a70] text-white text-xs rounded-full">
                {[searchTerm, selectedStatus].filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#13d090] hover:bg-[#10b87a] text-white"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4a70]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="unsubscribed">Désinscrit</option>
                </select>
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubscribers(subscribers.map((s: any) => s.id));
                      } else {
                        setSelectedSubscribers([]);
                      }
                    }}
                    checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'email') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('email');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Email</span>
                    {sortBy === 'email' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'createdAt') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('createdAt');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Date d'inscription</span>
                    {sortBy === 'createdAt' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (sortBy === 'status') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('status');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Statut</span>
                    {sortBy === 'status' ? (
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
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun abonné trouvé
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber: any) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                          } else {
                            setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(subscriber.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((currentPage - 1) * limit) + 1} à {Math.min(currentPage * limit, pagination.total)} sur {pagination.total} abonnés
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#13d090] hover:bg-[#10b87a]" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
