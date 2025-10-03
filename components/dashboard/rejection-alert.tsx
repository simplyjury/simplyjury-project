'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface RejectionAlertProps {
  rejectionReason?: string;
  onResubmit?: () => void;
}

export default function RejectionAlert({ rejectionReason, onResubmit }: RejectionAlertProps) {
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitted, setResubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResubmit = async () => {
    setIsResubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile/jury/resubmit', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la re-soumission');
      }

      setResubmitted(true);
      
      // Call the callback if provided
      if (onResubmit) {
        onResubmit();
      }
      
      // Refresh the page after a short delay to show the updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsResubmitting(false);
    }
  };

  if (resubmitted) {
    return (
      <Alert className="mb-8 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <div>
              <strong>Profil soumis à nouveau avec succès !</strong>
            </div>
            <div className="text-sm">
              Votre profil est maintenant en cours de validation par notre équipe. 
              Vous recevrez une notification par email une fois la validation terminée.
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-8 border-red-200 bg-red-50">
      <XCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-3">
          <div>
            <strong>Profil rejeté par un administrateur</strong>
          </div>
          {rejectionReason && (
            <div>
              <span className="font-medium">Motif du rejet :</span> {rejectionReason}
            </div>
          )}
          <div className="text-sm">
            Votre profil de jury a été rejeté et ne peut pas accéder aux fonctionnalités de la plateforme. 
            Vous pouvez corriger les éléments mentionnés et soumettre à nouveau votre profil pour révision.
          </div>
          {error && (
            <div className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
              {error}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Link href="/dashboard/profile">
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Modifier mon profil
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleResubmit}
              disabled={isResubmitting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResubmitting ? 'animate-spin' : ''}`} />
              {isResubmitting ? 'Soumission...' : 'Soumettre à nouveau'}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
