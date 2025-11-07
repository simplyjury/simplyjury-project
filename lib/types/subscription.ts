// Epic 07 - Subscription System Types
// These types define the structure for subscription management, contact limits, and waiting list

/**
 * Subscription tier options
 */
export type SubscriptionTier = 'gratuit' | 'basic' | 'pro';

/**
 * Waiting list entry status
 */
export type WaitingListStatus = 'pending' | 'contacted' | 'converted' | 'declined';

/**
 * How the user joined the waiting list
 */
export type WaitingListTrigger = 'limit_reached' | 'pricing_page' | 'dashboard_cta' | 'manual';

/**
 * Contact limit history event types
 */
export type ContactLimitEventType =
  | 'contact_used'           // Jury accepted a request
  | 'contact_refunded'       // Admin refunded a contact
  | 'limit_reset'            // 30-day period reset
  | 'manual_adjustment'      // Admin manually adjusted limit
  | 'tier_upgrade'           // User upgraded tier
  | 'tier_downgrade'         // User downgraded tier
  | 'premium_access_granted' // Admin granted temporary premium
  | 'premium_access_expired'; // Temporary premium expired

/**
 * Subscription tier configuration
 */
export interface TierConfig {
  name: SubscriptionTier;
  displayName: string;
  contactLimit: number;
  price: number; // Monthly price in euros (0 for gratuit)
  features: string[];
}

/**
 * Subscription status for a training center
 */
export interface SubscriptionStatus {
  tier: SubscriptionTier;
  contactsLimit: number;
  contactsUsed: number;
  contactsRemaining: number;
  periodStartDate: Date | null;
  periodEndDate: Date | null;
  daysUntilReset: number | null;
  isAtLimit: boolean;
  hasPremiumAccess: boolean;
  premiumAccessExpiresAt: Date | null;
  hasManualOverride: boolean;
  manualOverrideLimit: number | null;
  manualOverrideExpiresAt: Date | null;
}

/**
 * Contact usage statistics
 */
export interface ContactStats {
  currentPeriod: {
    used: number;
    limit: number;
    remaining: number;
    startDate: Date | null;
    endDate: Date | null;
  };
  history: {
    totalContactsAllTime: number;
    averagePerPeriod: number;
    periodsCompleted: number;
  };
  recentActivity: Array<{
    date: Date;
    juryName: string;
    certificationTitle: string;
  }>;
}

/**
 * Result of checking if a center can contact a jury
 */
export interface CanContactResult {
  canContact: boolean;
  reason?: string;
  contactsRemaining: number;
  needsUpgrade: boolean;
  suggestedTier?: SubscriptionTier;
}

/**
 * Waiting list entry data
 */
export interface WaitingListEntry {
  email: string;
  desiredTier: 'basic' | 'pro';
  triggeredBy?: WaitingListTrigger;
  currentContactsUsed?: number;
}

/**
 * Waiting list statistics
 */
export interface WaitingListStats {
  total: number;
  byTier: {
    basic: number;
    pro: number;
  };
  byStatus: {
    pending: number;
    contacted: number;
    converted: number;
    declined: number;
  };
  byTrigger: {
    limit_reached: number;
    pricing_page: number;
    dashboard_cta: number;
    manual: number;
  };
  conversionRate: number; // Percentage of contacted that converted
}

/**
 * Admin action for granting premium access
 */
export interface GrantPremiumAccessParams {
  trainingCenterId: number;
  expiresAt: Date;
  reason: string;
  grantedBy: number;
}

/**
 * Admin action for setting manual limit override
 */
export interface SetManualLimitParams {
  trainingCenterId: number;
  newLimit: number;
  reason: string;
  expiresAt?: Date;
  performedBy: number;
}

/**
 * Admin action for refunding a contact
 */
export interface RefundContactParams {
  trainingCenterId: number;
  juryRequestId: number;
  reason: string;
  performedBy: number;
}

/**
 * Contact limit history entry for audit trail
 */
export interface ContactLimitHistoryEntry {
  eventType: ContactLimitEventType;
  contactsUsedBefore: number;
  contactsUsedAfter: number;
  contactsLimitBefore: number;
  contactsLimitAfter: number;
  subscriptionTierBefore?: SubscriptionTier;
  subscriptionTierAfter?: SubscriptionTier;
  performedBy?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Subscription tier upgrade/downgrade params
 */
export interface ChangeTierParams {
  trainingCenterId: number;
  newTier: SubscriptionTier;
  performedBy?: number;
  reason?: string;
}

/**
 * Service response wrapper for error handling
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
