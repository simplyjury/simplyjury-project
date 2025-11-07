'use client';

// Epic 07 - Tier Comparison Table Component
// Displays pricing tiers comparison for pricing page

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Gift, Zap, X } from 'lucide-react';
import { getTierComparison } from '@/lib/utils/subscription-helpers';

interface TierComparisonTableProps {
  onJoinWaitingList: (tier: 'basic' | 'pro') => void;
  currentTier?: 'gratuit' | 'basic' | 'pro';
  className?: string;
}

export function TierComparisonTable({
  onJoinWaitingList,
  currentTier = 'gratuit',
  className = '',
}: TierComparisonTableProps) {
  const tiers = getTierComparison();

  const getTierIcon = (tierName: string) => {
    if (tierName === 'gratuit') return Gift;
    if (tierName === 'basic') return Zap;
    return Crown;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {tiers.map((tier) => {
        const TierIcon = getTierIcon(tier.tier);
        const isCurrent = currentTier === tier.tier;
        const isRecommended = tier.recommended;

        return (
          <Card
            key={tier.tier}
            className={`relative ${
              isRecommended
                ? 'border-2 border-primary shadow-lg'
                : isCurrent
                ? 'border-2 border-green-500'
                : ''
            }`}
          >
            {/* Recommended Badge */}
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white">
                  Recommandé
                </Badge>
              </div>
            )}

            {/* Current Badge */}
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white">
                  Votre forfait actuel
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className={`rounded-full p-3 ${
                  tier.tier === 'gratuit' ? 'bg-gray-100' :
                  tier.tier === 'basic' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <TierIcon className={`h-8 w-8 ${
                    tier.tier === 'gratuit' ? 'text-gray-600' :
                    tier.tier === 'basic' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription className="text-3xl font-bold text-gray-900 mt-2">
                {tier.priceText}
              </CardDescription>
              <p className="text-sm text-gray-600 mt-1">
                {tier.contactLimit} contact{tier.contactLimit > 1 ? 's' : ''} / 30 jours
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features List */}
              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                {tier.tier === 'gratuit' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Forfait actuel' : 'Gratuit'}
                  </Button>
                ) : tier.available ? (
                  <Button
                    className="w-full"
                    onClick={() => onJoinWaitingList(tier.tier as 'basic' | 'pro')}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Forfait actuel' : 'Choisir ce forfait'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => onJoinWaitingList(tier.tier as 'basic' | 'pro')}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Forfait actuel' : 'Rejoindre la liste d\'attente'}
                  </Button>
                )}
              </div>

              {/* MVP Notice for paid tiers */}
              {tier.tier !== 'gratuit' && !tier.available && (
                <p className="text-xs text-center text-gray-500">
                  Paiements bientôt disponibles
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Compact version for smaller spaces
export function TierComparisonCompact({
  onJoinWaitingList,
  className = '',
}: Omit<TierComparisonTableProps, 'currentTier'>) {
  const tiers = getTierComparison();

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium text-gray-900">Fonctionnalité</th>
            {tiers.map((tier) => (
              <th key={tier.tier} className="text-center p-4">
                <div className="font-semibold text-gray-900">{tier.name}</div>
                <div className="text-sm text-gray-600 mt-1">{tier.priceText}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b bg-gray-50">
            <td className="p-4 font-medium">Contacts par mois</td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                <span className="font-semibold text-primary">{tier.contactLimit}</span>
              </td>
            ))}
          </tr>
          {/* Add more feature rows as needed */}
          <tr className="border-b">
            <td className="p-4">Messagerie</td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                {tier.tier === 'gratuit' ? (
                  <span className="text-gray-500">Basique</span>
                ) : (
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                )}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4">Tableau de bord</td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                {tier.tier === 'pro' ? (
                  <span className="text-green-600 font-medium">Complet</span>
                ) : tier.tier === 'basic' ? (
                  <span className="text-blue-600">Simplifié</span>
                ) : (
                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                )}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4">Badge "OF Pro vérifié"</td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                {tier.tier === 'pro' ? (
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4">Support</td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                {tier.tier === 'pro' ? (
                  <span className="text-green-600 font-medium">Prioritaire</span>
                ) : (
                  <span className="text-gray-600">Email</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="p-4"></td>
            {tiers.map((tier) => (
              <td key={tier.tier} className="text-center p-4">
                {tier.tier === 'gratuit' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Gratuit
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => onJoinWaitingList(tier.tier as 'basic' | 'pro')}
                  >
                    Rejoindre
                  </Button>
                )}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
