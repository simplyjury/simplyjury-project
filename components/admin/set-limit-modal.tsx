'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Settings, Calendar, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  subscriptionTier: string;
  contactsUsed: number;
  contactsLimit: number;
}

interface SetLimitModalProps {
  center: TrainingCenter;
  onClose: () => void;
  onSuccess: () => void;
}

export function SetLimitModal({ center, onClose, onSuccess }: SetLimitModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newLimit, setNewLimit] = useState<string>(center.contactsLimit.toString());
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const limitValue = parseInt(newLimit);
    
    if (isNaN(limitValue) || limitValue < 0) {
      showToast({ type: 'error', title: 'La limite doit être un nombre positif' });
      return;
    }

    if (!reason.trim()) {
      showToast({ type: 'error', title: 'Veuillez indiquer une raison' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/subscription/set-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingCenterId: center.id,
          newLimit: limitValue,
          reason: reason.trim(),
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la définition de la limite');
      }

      showToast({ type: 'success', title: 'Limite manuelle définie avec succès' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error setting limit:', error);
      showToast({ 
        type: 'error', 
        title: error instanceof Error ? error.message : 'Erreur lors de la définition de la limite' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
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
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle>Définir une Limite Manuelle</CardTitle>
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
                <p className="text-sm text-gray-500">Plan actuel</p>
                <p className="font-medium capitalize">{center.subscriptionTier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Limite actuelle</p>
                <p className="font-medium">{center.contactsLimit} contacts/mois</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacts utilisés</p>
                <p className="font-medium">{center.contactsUsed}/{center.contactsLimit}</p>
              </div>
            </div>

            {/* New Limit */}
            <div className="space-y-2">
              <Label htmlFor="newLimit" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Nouvelle limite *
              </Label>
              <Input
                id="newLimit"
                type="number"
                min="0"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Ex: 5"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Nombre de contacts autorisés par période de 30 jours
              </p>
            </div>

            {/* Expiration Date (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date d'expiration (optionnel)
              </Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Laissez vide pour une limite permanente
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Ajustement temporaire pour un événement spécial, compensation pour un problème..."
                rows={3}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Cette raison sera enregistrée dans l'historique
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note :</strong> Cette limite remplacera temporairement la limite du plan d'abonnement.
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
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Traitement...' : 'Définir la limite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
