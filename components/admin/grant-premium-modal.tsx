'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Sparkles, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  subscriptionTier: string;
  contactsUsed: number;
  contactsLimit: number;
}

interface GrantPremiumModalProps {
  center: TrainingCenter;
  onClose: () => void;
  onSuccess: () => void;
}

export function GrantPremiumModal({ center, onClose, onSuccess }: GrantPremiumModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');

  // Set default expiration to 30 days from now
  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expiresAt || !reason.trim()) {
      showToast({ type: 'error', title: 'Veuillez remplir tous les champs' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/subscription/grant-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingCenterId: center.id,
          expiresAt,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'octroi de l\'accès premium');
      }

      showToast({ type: 'success', title: 'Accès premium accordé avec succès' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error granting premium access:', error);
      showToast({ 
        type: 'error', 
        title: error instanceof Error ? error.message : 'Erreur lors de l\'octroi de l\'accès premium' 
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
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Accorder l'Accès Premium</CardTitle>
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
                <p className="text-sm text-gray-500">Contacts utilisés</p>
                <p className="font-medium">{center.contactsUsed}/{center.contactsLimit}</p>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date d'expiration *
              </Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                defaultValue={getDefaultExpiration()}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                L'accès premium expirera automatiquement à cette date
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
                placeholder="Ex: Compensation pour un problème technique, test de fonctionnalité, partenariat spécial..."
                rows={3}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Cette raison sera enregistrée dans l'historique
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>Accès Premium :</strong> Le centre aura accès à 15 contacts/mois jusqu'à la date d'expiration.
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Traitement...' : 'Accorder l\'accès'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
