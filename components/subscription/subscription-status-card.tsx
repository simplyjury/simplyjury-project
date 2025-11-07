'use client';

// Epic 07 - Subscription Status Card Component
// Displays current subscription tier, contact limits, and usage

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Crown, Gift, Zap, Calendar, TrendingUp } from 'lucide-react';
import type { SubscriptionStatus } from '@/lib/types/subscription';
import {
  formatTierName,
  getTierBadgeColor,
  formatDaysRemaining,
  getUsagePercentage,
  getProgressBarColor,
  formatContactUsage,
  formatPremiumAccessExpiry,
  isPremiumAccessExpiringSoon,
} from '@/lib/utils/subscription-helpers';

interface SubscriptionStatusCardProps {
  status: SubscriptionStatus;
  onUpgradeClick?: () => void;
  showUpgradeButton?: boolean;
}

export function SubscriptionStatusCard({
  status,
  onUpgradeClick,
  showUpgradeButton = true,
}: SubscriptionStatusCardProps) {
  const usagePercentage = getUsagePercentage(status.contactsUsed, status.contactsLimit);
  const progressColor = getProgressBarColor(usagePercentage);

  // Get tier icon
  const TierIcon = status.tier === 'pro' ? Crown : status.tier === 'basic' ? Zap : Gift;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TierIcon className="h-5 w-5 text-primary" />
            <CardTitle>Abonnement {formatTierName(status.tier)}</CardTitle>
          </div>
          <Badge className={getTierBadgeColor(status.tier)}>
            {formatTierName(status.tier)}
          </Badge>
        </div>
        <CardDescription>
          Gérez vos contacts avec les jurys professionnels
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Premium Access Alert */}
        {status.hasPremiumAccess && (
          <div className={`rounded-lg p-4 ${
            isPremiumAccessExpiringSoon(status.premiumAccessExpiresAt)
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex items-start gap-3">
              <Crown className={`h-5 w-5 mt-0.5 ${
                isPremiumAccessExpiringSoon(status.premiumAccessExpiresAt)
                  ? 'text-orange-600'
                  : 'text-purple-600'
              }`} />
              <div className="flex-1">
                <p className={`font-medium ${
                  isPremiumAccessExpiringSoon(status.premiumAccessExpiresAt)
                    ? 'text-orange-900'
                    : 'text-purple-900'
                }`}>
                  Accès Premium Actif
                </p>
                <p className={`text-sm ${
                  isPremiumAccessExpiringSoon(status.premiumAccessExpiresAt)
                    ? 'text-orange-700'
                    : 'text-purple-700'
                }`}>
                  {formatPremiumAccessExpiry(status.premiumAccessExpiresAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Override Alert */}
        {status.hasManualOverride && !status.hasPremiumAccess && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">
                  Limite Ajustée
                </p>
                <p className="text-sm text-blue-700">
                  Limite personnalisée: {status.manualOverrideLimit} contacts
                  {status.manualOverrideExpiresAt && (
                    <> · Expire le {new Date(status.manualOverrideExpiresAt).toLocaleDateString('fr-FR')}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Contacts utilisés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatContactUsage(status.contactsUsed, status.contactsLimit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Restants</p>
              <p className={`text-2xl font-bold ${
                status.contactsRemaining === 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {status.contactsRemaining}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              {usagePercentage}% utilisé
            </p>
          </div>
        </div>

        {/* Period Information */}
        {status.periodStartDate && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Période actuelle
                </p>
                <p className="text-sm text-gray-600">
                  {formatDaysRemaining(status.daysUntilReset)}
                </p>
                {status.daysUntilReset !== null && status.daysUntilReset > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Début: {new Date(status.periodStartDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* At Limit Warning */}
        {status.isAtLimit && !status.hasPremiumAccess && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-900">
              Limite atteinte
            </p>
            <p className="text-sm text-red-700 mt-1">
              Vous avez utilisé tous vos contacts pour cette période.
              {status.daysUntilReset !== null && status.daysUntilReset > 0 && (
                <> Réinitialisation dans {status.daysUntilReset} jour{status.daysUntilReset > 1 ? 's' : ''}.</>
              )}
            </p>
          </div>
        )}

        {/* Upgrade Button */}
        {showUpgradeButton && status.tier !== 'pro' && !status.hasPremiumAccess && (
          <Button
            onClick={onUpgradeClick}
            className="w-full"
            variant={status.isAtLimit ? 'default' : 'outline'}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {status.isAtLimit ? 'Passer au forfait supérieur' : 'Découvrir les forfaits'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
