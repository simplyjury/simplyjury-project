'use client';

// Epic 07 - Subscription Widget Component
// Compact widget for dashboard showing subscription status

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';
import type { SubscriptionStatus } from '@/lib/types/subscription';
import {
  formatTierName,
  getUsagePercentage,
  formatContactUsage,
  formatDaysRemaining,
} from '@/lib/utils/subscription-helpers';

interface SubscriptionWidgetProps {
  onUpgradeClick?: () => void;
  onViewDetails?: () => void;
}

export function SubscriptionWidget({
  onUpgradeClick,
  onViewDetails,
}: SubscriptionWidgetProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      const data = await response.json();
      setStatus(data.data);
    } catch (err) {
      setError('Erreur de chargement');
      console.error('Error fetching subscription status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{error || 'Données non disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = getUsagePercentage(status.contactsUsed, status.contactsLimit);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = status.isAtLimit;

  return (
    <Card className={isAtLimit ? 'border-red-200 bg-red-50/50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Abonnement
          </CardTitle>
          <span className="text-xs font-medium text-gray-600">
            {formatTierName(status.tier)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Usage Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Contacts</span>
            <span className={`text-sm font-semibold ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-green-600'
            }`}>
              {formatContactUsage(status.contactsUsed, status.contactsLimit)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Period Info */}
        {status.periodStartDate && (
          <p className="text-xs text-gray-500">
            {formatDaysRemaining(status.daysUntilReset)}
          </p>
        )}

        {/* At Limit Warning */}
        {isAtLimit && (
          <div className="flex items-start gap-2 p-2 bg-red-100 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800">
              Limite atteinte. Passez au forfait supérieur pour continuer.
            </p>
          </div>
        )}

        {/* Premium Access Badge */}
        {status.hasPremiumAccess && (
          <div className="p-2 bg-purple-100 rounded-lg">
            <p className="text-xs font-medium text-purple-900">
              ✨ Accès Premium Actif
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex-1 text-xs"
            >
              Détails
            </Button>
          )}
          {onUpgradeClick && status.tier !== 'pro' && !status.hasPremiumAccess && (
            <Button
              size="sm"
              onClick={onUpgradeClick}
              className="flex-1 text-xs"
              variant={isAtLimit ? 'default' : 'outline'}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
