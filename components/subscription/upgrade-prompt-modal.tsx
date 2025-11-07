'use client';

// Epic 07 - Upgrade Prompt Modal Component
// Shown when user reaches contact limit

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Check } from 'lucide-react';
import type { SubscriptionStatus, SubscriptionTier } from '@/lib/types/subscription';
import {
  formatTierName,
  getUpgradePromptMessage,
  getSuggestedUpgradeTier,
  getTierFeatures,
  formatPrice,
} from '@/lib/utils/subscription-helpers';
import { TIER_CONFIGS } from '@/lib/constants/subscription-tiers';

interface UpgradePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: SubscriptionStatus;
  onJoinWaitingList: (tier: 'basic' | 'pro') => void;
}

export function UpgradePromptModal({
  open,
  onOpenChange,
  status,
  onJoinWaitingList,
}: UpgradePromptModalProps) {
  const suggestedTier = getSuggestedUpgradeTier(status.tier);
  const suggestedConfig = TIER_CONFIGS[suggestedTier];
  const message = getUpgradePromptMessage(status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl">
              {status.isAtLimit ? 'Limite atteinte' : 'Bientôt à la limite'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Tier */}
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">
                Forfait actuel: {formatTierName(status.tier)}
              </p>
              <p className="text-sm text-gray-600">
                {status.contactsLimit} contact{status.contactsLimit > 1 ? 's' : ''}/mois
              </p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${(status.contactsUsed / status.contactsLimit) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {status.contactsUsed}/{status.contactsLimit} utilisés
            </p>
          </div>

          {/* Suggested Tier */}
          <div className="rounded-lg border-2 border-primary p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  Forfait {formatTierName(suggestedTier)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(suggestedConfig.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {suggestedConfig.contactLimit}
                </p>
                <p className="text-xs text-gray-600">contacts/mois</p>
              </div>
            </div>

            <div className="space-y-2">
              {getTierFeatures(suggestedTier).slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MVP Notice */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-900 font-medium mb-1">
              💡 Paiements bientôt disponibles
            </p>
            <p className="text-xs text-blue-700">
              Rejoignez la liste d'attente pour être informé dès que les abonnements payants seront disponibles.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Plus tard
          </Button>
          <Button
            onClick={() => {
              onJoinWaitingList(suggestedTier as 'basic' | 'pro');
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Rejoindre la liste d'attente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
