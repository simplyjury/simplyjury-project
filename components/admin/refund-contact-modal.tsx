'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  subscriptionTier: string;
  contactsUsed: number;
  contactsLimit: number;
}

interface JuryRequest {
  id: number;
  certification_title: string;
  session_date: string;
  jury_name: string;
  status: string;
}

interface RefundContactModalProps {
  center: TrainingCenter;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundContactModal({ center, onClose, onSuccess }: RefundContactModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requests, setRequests] = useState<JuryRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  // Fetch accepted requests for this center
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/admin/jury-requests?centerId=${center.id}&status=accepted`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setRequests(data.data);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        showToast({ type: 'error', title: 'Erreur lors du chargement des demandes' });
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [center.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      showToast({ type: 'error', title: 'Veuillez sélectionner une demande' });
      return;
    }

    if (!reason.trim()) {
      showToast({ type: 'error', title: 'Veuillez indiquer une raison' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/subscription/refund-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingCenterId: center.id,
          juryRequestId: selectedRequestId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du remboursement');
      }

      showToast({ type: 'success', title: 'Contact remboursé avec succès' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error refunding contact:', error);
      showToast({ 
        type: 'error', 
        title: error instanceof Error ? error.message : 'Erreur lors du remboursement' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            <CardTitle>Rembourser un Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Center Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <p className="text-sm text-gray-500">Centre</p>
                <p className="font-medium">{center.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacts utilisés</p>
                <p className="font-medium">{center.contactsUsed}/{center.contactsLimit}</p>
              </div>
            </div>

            {/* Warning if no contacts used */}
            {center.contactsUsed === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Ce centre n'a utilisé aucun contact pour le moment.
                </p>
              </div>
            )}

            {/* Select Request */}
            <div className="space-y-2">
              <Label htmlFor="requestId">
                Sélectionner la demande à rembourser *
              </Label>
              {loadingRequests ? (
                <div className="text-sm text-gray-500 py-2">
                  Chargement des demandes...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-sm text-gray-500 py-2 bg-gray-50 rounded-lg p-3">
                  Aucune demande acceptée trouvée pour ce centre.
                </div>
              ) : (
                <select
                  id="requestId"
                  value={selectedRequestId || ''}
                  onChange={(e) => setSelectedRequestId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13d090]"
                  required
                  disabled={loading}
                >
                  <option value="">-- Choisir une demande --</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.certification_title} - {new Date(request.session_date).toLocaleDateString('fr-FR')} - {request.jury_name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500">
                Seules les demandes acceptées sont affichées
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison du remboursement *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Erreur système, jury annulé, problème technique..."
                rows={3}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Cette raison sera enregistrée dans l'historique
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p className="text-sm text-orange-900">
                <strong>Attention :</strong> Cette action va décrémenter le compteur de contacts utilisés de 1. Le centre pourra réutiliser ce contact.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || center.contactsUsed === 0 || requests.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Traitement...' : 'Rembourser'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
