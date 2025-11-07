'use client';

// Epic 07 - Admin Waiting List Management Page
// Allows admins to view and manage subscription waiting list

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  FileText,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface WaitingListEntry {
  id: number;
  email: string;
  desiredTier: 'basic' | 'pro';
  status: 'pending' | 'contacted' | 'converted' | 'declined';
  triggeredBy: string;
  currentContactsUsed: number | null;
  createdAt: string;
  contactedAt: string | null;
  contactedBy: number | null;
  contactNotes: string | null;
}

export default function AdminWaitingListPage() {
  const [entries, setEntries] = useState<WaitingListEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WaitingListEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitingListEntry | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, filterStatus, filterTier, entries]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        // Check if click is outside the menu
        if (!target.closest('.action-menu-container')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/waiting-list');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching waiting list:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger la liste d\'attente',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(entry => entry.status === filterStatus);
    }

    if (filterTier !== 'all') {
      filtered = filtered.filter(entry => entry.desiredTier === filterTier);
    }

    setFilteredEntries(filtered);
  };

  const handleMarkAsContacted = async (entryId: number) => {
    try {
      const notes = prompt('Notes de contact (optionnel):');
      const response = await fetch(`/api/admin/waiting-list/${entryId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Succès',
          message: 'Entrée marquée comme contactée',
          duration: 3000
        });
        fetchEntries();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour l\'entrée',
        duration: 4000
      });
    }
  };

  const handleUpdateStatus = async (entryId: number, newStatus: 'converted' | 'declined' | 'pending') => {
    try {
      const response = await fetch(`/api/admin/waiting-list/${entryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const statusLabels = {
          converted: 'converti',
          declined: 'refusé',
          pending: 'en attente'
        };
        showToast({
          type: 'success',
          title: 'Succès',
          message: `Entrée marquée comme ${statusLabels[newStatus]}`,
          duration: 3000
        });
        fetchEntries();
        setOpenMenuId(null);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le statut',
        duration: 4000
      });
    }
  };

  const handleEditNotes = (entry: WaitingListEntry) => {
    setSelectedEntry(entry);
    setShowEditNotesModal(true);
    setOpenMenuId(null);
  };

  const handleSaveNotes = async (notes: string) => {
    if (!selectedEntry) return;

    try {
      const response = await fetch(`/api/admin/waiting-list/${selectedEntry.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Succès',
          message: 'Notes mises à jour',
          duration: 3000
        });
        fetchEntries();
        setShowEditNotesModal(false);
        setSelectedEntry(null);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour les notes',
        duration: 4000
      });
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;

    try {
      const response = await fetch(`/api/admin/waiting-list/${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Succès',
          message: 'Entrée supprimée',
          duration: 3000
        });
        fetchEntries();
        setOpenMenuId(null);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer l\'entrée',
        duration: 4000
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En attente' },
      contacted: { color: 'bg-blue-100 text-blue-700', icon: Mail, label: 'Contacté' },
      converted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Converti' },
      declined: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Refusé' }
    };

    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge className={`${color} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Plan Souhaité', 'Statut', 'Source', 'Date', 'Contacté Le'].join(','),
      ...filteredEntries.map(entry => [
        entry.email,
        entry.desiredTier,
        entry.status,
        entry.triggeredBy,
        new Date(entry.createdAt).toLocaleDateString('fr-FR'),
        entry.contactedAt ? new Date(entry.contactedAt).toLocaleDateString('fr-FR') : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waiting-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
            Liste d'Attente Abonnements
          </h1>
          <p className="text-gray-600">
            Gérez les demandes d'abonnement en attente
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-[#0d4a70]">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">En Attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {entries.filter(e => e.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Contactés</p>
            <p className="text-2xl font-bold text-blue-600">
              {entries.filter(e => e.status === 'contacted').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Convertis</p>
            <p className="text-2xl font-bold text-green-600">
              {entries.filter(e => e.status === 'converted').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="contacted">Contacté</option>
              <option value="converted">Converti</option>
              <option value="declined">Refusé</option>
            </select>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">Tous les plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
            <Button onClick={fetchEntries} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucune entrée trouvée</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">{entry.email}</td>
                      <td className="px-4 py-4">
                        <Badge className={entry.desiredTier === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                          {entry.desiredTier.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(entry.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{entry.triggeredBy}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-4">
                        {entry.contactNotes ? (
                          <div className="group relative">
                            <FileText className="h-4 w-4 text-blue-600 cursor-help" />
                            <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg -left-32 top-6">
                              <p className="text-xs text-gray-700 whitespace-pre-wrap">{entry.contactNotes}</p>
                              {entry.contactedAt && (
                                <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                                  {new Date(entry.contactedAt).toLocaleDateString('fr-FR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative action-menu-container">
                          {entry.status === 'pending' ? (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsContacted(entry.id)}
                              className="text-xs"
                            >
                              Marquer contacté
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
                                className="p-2"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              
                              {openMenuId === entry.id && (
                                <div className="absolute right-0 top-8 z-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                                  <div className="py-1">
                                    {entry.status === 'contacted' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(entry.id, 'converted')}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          Marquer converti
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(entry.id, 'declined')}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <XCircle className="h-4 w-4 text-red-600" />
                                          Marquer refusé
                                        </button>
                                      </>
                                    )}
                                    
                                    {(entry.status === 'converted' || entry.status === 'declined') && (
                                      <button
                                        onClick={() => handleUpdateStatus(entry.id, 'pending')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        Remettre en attente
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => handleEditNotes(entry)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                      Modifier notes
                                    </button>
                                    
                                    <div className="border-t border-gray-200 my-1"></div>
                                    
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Notes Modal */}
      {showEditNotesModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier les notes</h3>
            <p className="text-sm text-gray-600 mb-4">
              Email: {selectedEntry.email}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={selectedEntry.contactNotes || ''}
              placeholder="Ajoutez vos notes de contact..."
              id="notes-textarea"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
                  handleSaveNotes(textarea.value);
                }}
                className="flex-1"
              >
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditNotesModal(false);
                  setSelectedEntry(null);
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
