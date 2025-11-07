// Epic 07 - Subscription Tier Configurations
// Shared constants for subscription tiers (safe for client-side use)

import type { TierConfig, SubscriptionTier } from '@/lib/types/subscription';

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  gratuit: {
    name: 'gratuit',
    displayName: 'Gratuit',
    contactLimit: 1,
    price: 0,
    features: [
      '1 contact par période de 30 jours',
      'Accès à la recherche de jurys',
      'Messagerie basique',
      'Profil de centre de formation',
    ],
  },
  basic: {
    name: 'basic',
    displayName: 'Basic',
    contactLimit: 5,
    price: 39,
    features: [
      '5 contacts par période de 30 jours',
      'Accès à la recherche de jurys',
      'Messagerie complète',
      'Tableau de bord simplifié',
      'Support par email',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    contactLimit: 15,
    price: 89,
    features: [
      '15 contacts par période de 30 jours',
      'Accès à la recherche de jurys',
      'Messagerie prioritaire',
      'Tableau de bord complet',
      'Badge "OF Pro vérifié"',
      'Support prioritaire',
      'Statistiques avancées',
    ],
  },
};
