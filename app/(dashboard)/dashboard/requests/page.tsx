'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { FileText, Search, Filter, Clock, CheckCircle, XCircle, Calendar, MapPin, Users, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JuryRequest {
  id: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  certification_type: string;
  session_date: string;
  candidate_count: number;
  modality: 'presentiel' | 'visio' | 'hybride';
  location?: string;
  created_at: string;
  training_centers: {
    name: string;
    contact_person_name: string;
    contact_person_email: string;
  };
  conversations?: Array<{
    id: number;
    created_at: string;
  }>;
}

interface RequestStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}

// Center requests component
function CenterRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, declined: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [certificationFilter, setCertificationFilter] = useState<string>('');

  useEffect(() => {
    fetchCenterRequests();
  }, [statusFilter, periodFilter, certificationFilter]);

  const fetchCenterRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (periodFilter) params.append('period', periodFilter);
      if (certificationFilter) params.append('certification', certificationFilter);
      
      const response = await fetch(`/api/center-requests?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setRequests(result.data || []);
        calculateStats(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error('Error fetching center requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requestsData: any[]) => {
    const stats = requestsData.reduce((acc, request) => {
      acc.total++;
      switch (request.status) {
        case 'pending':
          acc.pending++;
          break;
        case 'accepted':
          acc.accepted++;
          break;
        case 'declined':
          acc.declined++;
          break;
      }
      return acc;
    }, { total: 0, pending: 0, accepted: 0, declined: 0 });
    
    setStats(stats);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            En attente de réponse
          </div>
        );
      case 'accepted':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Acceptée
          </div>
        );
      case 'declined':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Refusée
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            {status}
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des demandes...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Mes demandes</h1>
            <p className="text-gray-600">Suivez le statut de vos demandes de jurys</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.pending}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Acceptées</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.declined}</div>
              <div className="text-sm text-gray-600">Refusées</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#0d4a70]/10 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-[#0d4a70]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="declined">Refusées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Période</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Toute période</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Certification</label>
            <select
              value={certificationFilter}
              onChange={(e) => setCertificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Toutes les certifications</option>
              <option value="informatique">Informatique</option>
              <option value="management">Management</option>
              <option value="commerce">Commerce</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0d4a70]">Historique des demandes</h3>
            <div className="text-sm text-gray-600">{stats.total} demandes au total</div>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Erreur</div>
            <div className="text-gray-600">{error}</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">
              Vous n'avez pas encore envoyé de demandes de jury.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request, index) => (
              <div key={request.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#0d4a70]">
                        {request.certification_type || 'Certification'}
                      </h3>
                      {getStatusBadge(request.status || 'pending')}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      RNCP{request.rncp_code || '00000'} - Niveau {request.level || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Jury Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {request.jury_name ? request.jury_name.split(' ').map((n: string) => n[0]).join('') : 'JU'}
                  </div>
                  <div>
                    <div className="font-semibold text-[#0d4a70]">{request.jury_name || 'Jury Non Assigné'}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                      <span>{request.jury_rating || '4.9'} ({request.jury_reviews || '45'} avis)</span>
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Demandé le {formatDate(request.created_at || new Date().toISOString())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Session prévue le {formatDate(request.session_date || new Date().toISOString())}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Candidats</div>
                    <div className="text-gray-600 text-sm">{request.candidate_count || 12}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Modalité</div>
                    <div className="text-gray-600 text-sm">{request.modality === 'presentiel' ? 'Présentiel' : request.modality === 'visio' ? 'Visioconférence' : 'Hybride'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Durée</div>
                    <div className="text-gray-600 text-sm">{request.duration || '2 jours'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-[#0d4a70] text-sm">Lieu</div>
                    <div className="text-gray-600 text-sm">{request.location || request.city || 'À définir'}</div>
                  </div>
                </div>

                {/* Message if accepted */}
                {request.status === 'accepted' && request.jury_message && (
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500 mb-4">
                    <div className="text-sm text-[#0d4a70] italic">
                      💬 "{request.jury_message}" - {request.jury_name}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  {request.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Relancer
                    </Button>
                  )}
                  {request.status === 'accepted' && (
                    <Button size="sm" className="bg-[#13d090] hover:bg-[#13d090]/90">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Messagerie
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

// Jury requests component
function JuryRequestsPage() {
  const [requests, setRequests] = useState<JuryRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({ total: 0, pending: 0, accepted: 0, declined: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/jury-requests?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setRequests(result.data);
        calculateStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requestsData: JuryRequest[]) => {
    const stats = requestsData.reduce((acc, request) => {
      acc.total++;
      switch (request.status) {
        case 'pending':
          acc.pending++;
          break;
        case 'accepted':
          acc.accepted++;
          break;
        case 'declined':
          acc.declined++;
          break;
      }
      return acc;
    }, { total: 0, pending: 0, accepted: 0, declined: 0 });
    
    setStats(stats);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Acceptée</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Refusée</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Terminée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'presentiel':
        return 'Présentiel';
      case 'visio':
        return 'Visioconférence';
      case 'hybride':
        return 'Hybride';
      default:
        return modality;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request =>
    request.training_centers.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.certification_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des demandes...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Mes demandes reçues</h1>
            <p className="text-gray-600">Consultez les demandes de missions reçues</p>
          </div>
          {stats.pending > 0 && (
            <div className="bg-gradient-to-r from-[#fdce0f] to-[#fee88c] text-[#0d4a70] px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 animate-pulse">
              <Clock className="w-4 h-4" />
              {stats.pending} nouvelle{stats.pending > 1 ? 's' : ''} demande{stats.pending > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#0d4a70]/10 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-[#0d4a70]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.pending}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Acceptées</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0d4a70]">{stats.declined}</div>
              <div className="text-sm text-gray-600">Refusées</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Rechercher</label>
            <Input
              placeholder="Centre ou certification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d4a70] focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="declined">Refusées</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setStatusFilter('');
                setSearchQuery('');
              }}
              variant="outline"
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-2">Erreur</div>
          <div className="text-gray-600">{error}</div>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-600">
            {requests.length === 0 
              ? "Vous n'avez pas encore reçu de demandes de mission."
              : "Aucune demande ne correspond à vos critères de recherche."
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#0d4a70]">
                      {request.training_centers.name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Contact: {request.training_centers.contact_person_name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Reçue le {formatDate(request.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  {request.conversations && request.conversations.length > 0 && (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Messages
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{request.certification_type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(request.session_date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{request.candidate_count} candidat{request.candidate_count > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{getModalityText(request.modality)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function RequestsPageContent() {
  const searchParams = useSearchParams();
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  // Role detection logic following the documented pattern
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfile?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));
  
  // Show loading state while determining user type
  if (!user) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    );
  }
  
  // Show appropriate component based on user type
  if (isJury) {
    return <JuryRequestsPage />;
  }
  
  return <CenterRequestsPage />;
}

// Main component with Suspense boundary
export default function RequestsPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </section>
    }>
      <RequestsPageContent />
    </Suspense>
  );
}
