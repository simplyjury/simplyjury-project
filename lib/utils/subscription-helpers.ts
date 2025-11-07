// Epic 07 - Subscription Helper Utilities
// UI helpers, formatters, and utility functions for subscription system

import type { SubscriptionTier, SubscriptionStatus } from '@/lib/types/subscription';

/**
 * Format subscription tier name for display
 */
export function formatTierName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    gratuit: 'Gratuit',
    basic: 'Basic',
    pro: 'Pro',
  };
  return names[tier];
}

/**
 * Get badge color for subscription tier
 * Used for UI badges and status indicators
 */
export function getTierBadgeColor(tier: SubscriptionTier): string {
  const colors: Record<SubscriptionTier, string> = {
    gratuit: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };
  return colors[tier];
}

/**
 * Get tier badge variant for shadcn/ui Badge component
 */
export function getTierBadgeVariant(tier: SubscriptionTier): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<SubscriptionTier, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    gratuit: 'secondary',
    basic: 'default',
    pro: 'default',
  };
  return variants[tier];
}

/**
 * Calculate days remaining until period reset
 */
export function getDaysUntilReset(periodStartDate: Date | null): number | null {
  if (!periodStartDate) return null;

  const periodEndDate = new Date(periodStartDate);
  periodEndDate.setDate(periodEndDate.getDate() + 30);

  const now = new Date();
  const msUntilReset = periodEndDate.getTime() - now.getTime();
  const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));

  return Math.max(0, daysUntilReset);
}

/**
 * Format days remaining text for display
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return 'Aucun contact utilisé';
  if (days === 0) return 'Se réinitialise aujourd\'hui';
  if (days === 1) return 'Se réinitialise demain';
  return `Se réinitialise dans ${days} jours`;
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((used / limit) * 100);
}

/**
 * Get progress bar color based on usage percentage
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-orange-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Check if should show upgrade prompt
 * Shows when user is at 80% or more of their limit
 */
export function shouldShowUpgradePrompt(status: SubscriptionStatus): boolean {
  // Don't show if already on Pro tier
  if (status.tier === 'pro') return false;

  // Don't show if has premium access
  if (status.hasPremiumAccess) return false;

  // Show if at limit
  if (status.isAtLimit) return true;

  // Show if at 80% or more
  const percentage = getUsagePercentage(status.contactsUsed, status.contactsLimit);
  return percentage >= 80;
}

/**
 * Get upgrade prompt message based on current tier and usage
 */
export function getUpgradePromptMessage(status: SubscriptionStatus): string {
  if (status.isAtLimit) {
    return `Vous avez atteint votre limite de ${status.contactsLimit} contact${status.contactsLimit > 1 ? 's' : ''} pour cette période. Passez au forfait supérieur pour contacter plus de jurys.`;
  }

  const remaining = status.contactsRemaining;
  return `Il ne vous reste que ${remaining} contact${remaining > 1 ? 's' : ''} pour cette période. Pensez à passer au forfait supérieur pour ne pas être bloqué.`;
}

/**
 * Get suggested tier for upgrade
 */
export function getSuggestedUpgradeTier(currentTier: SubscriptionTier): SubscriptionTier {
  if (currentTier === 'gratuit') return 'basic';
  if (currentTier === 'basic') return 'pro';
  return 'pro'; // Already at highest
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit';
  return `${price}€/mois`;
}

/**
 * Get tier features list
 */
export function getTierFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    gratuit: [
      '1 jury par période de 30 jours',
      'Messagerie basique',
      'Support par email',
      'Visibilité standard',
    ],
    basic: [
      '5 jurys par période de 30 jours',
      'Messagerie complète',
      'Tableau de bord simplifié',
      'Support par email',
      'Visibilité standard',
    ],
    pro: [
      '15 jurys par période de 30 jours',
      'Tableau de bord complet',
      'Gestion des certifications',
      'Suivi et traçabilité des missions',
      'Exports (Excel, PDF)',
      'Badge "OF Pro vérifié"',
      'Support prioritaire',
      'Visibilité prioritaire',
    ],
  };
  return features[tier];
}

/**
 * Check if tier is available for subscription
 * In MVP, only gratuit is active. Basic and Pro require waiting list.
 */
export function isTierAvailableForSubscription(tier: SubscriptionTier): boolean {
  return tier === 'gratuit'; // MVP: Only free tier is directly available
}

/**
 * Get waiting list CTA text based on tier
 */
export function getWaitingListCTA(tier: 'basic' | 'pro'): string {
  const ctas: Record<'basic' | 'pro', string> = {
    basic: 'Rejoindre la liste d\'attente Basic',
    pro: 'Rejoindre la liste d\'attente Pro',
  };
  return ctas[tier];
}

/**
 * Format contact limit text
 */
export function formatContactLimit(limit: number): string {
  return `${limit} contact${limit > 1 ? 's' : ''} / 30 jours`;
}

/**
 * Format contact usage text
 */
export function formatContactUsage(used: number, limit: number): string {
  return `${used} / ${limit} contact${limit > 1 ? 's' : ''} utilisé${used > 1 ? 's' : ''}`;
}

/**
 * Get status text for waiting list entry
 */
export function getWaitingListStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'En attente',
    contacted: 'Contacté',
    converted: 'Converti',
    declined: 'Refusé',
  };
  return texts[status] || status;
}

/**
 * Get status badge color for waiting list
 */
export function getWaitingListStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    declined: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if premium access is expiring soon (within 7 days)
 */
export function isPremiumAccessExpiringSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;

  const now = new Date();
  const expiryDate = new Date(expiresAt);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Format premium access expiry text
 */
export function formatPremiumAccessExpiry(expiresAt: Date | null): string {
  if (!expiresAt) return '';

  const now = new Date();
  const expiryDate = new Date(expiresAt);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'Expiré';
  if (daysUntilExpiry === 0) return 'Expire aujourd\'hui';
  if (daysUntilExpiry === 1) return 'Expire demain';
  return `Expire dans ${daysUntilExpiry} jours`;
}

/**
 * Get icon name for tier (for use with Lucide icons)
 */
export function getTierIcon(tier: SubscriptionTier): string {
  const icons: Record<SubscriptionTier, string> = {
    gratuit: 'Gift',
    basic: 'Zap',
    pro: 'Crown',
  };
  return icons[tier];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get tier comparison data for pricing table
 */
export function getTierComparison(): Array<{
  tier: SubscriptionTier;
  name: string;
  price: number;
  priceText: string;
  contactLimit: number;
  features: string[];
  recommended: boolean;
  available: boolean;
}> {
  return [
    {
      tier: 'gratuit',
      name: 'Gratuit',
      price: 0,
      priceText: 'Gratuit',
      contactLimit: 1,
      features: getTierFeatures('gratuit'),
      recommended: false,
      available: true,
    },
    {
      tier: 'basic',
      name: 'Basic',
      price: 39,
      priceText: '39€/mois',
      contactLimit: 5,
      features: getTierFeatures('basic'),
      recommended: true,
      available: false, // MVP: Waiting list only
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: 89,
      priceText: '89€/mois',
      contactLimit: 15,
      features: getTierFeatures('pro'),
      recommended: false,
      available: false, // MVP: Waiting list only
    },
  ];
}
