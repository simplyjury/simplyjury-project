// Epic 07 - Subscription Service
// Handles subscription tier management, contact limits, and admin overrides

import { db } from '@/lib/db/drizzle';
import { trainingCenters, contactLimitHistory } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import type {
  SubscriptionTier,
  TierConfig,
  SubscriptionStatus,
  GrantPremiumAccessParams,
  SetManualLimitParams,
  ChangeTierParams,
  ServiceResponse,
  ContactLimitHistoryEntry,
} from '@/lib/types/subscription';
import { TIER_CONFIGS } from '@/lib/constants/subscription-tiers';

/**
 * Get tier configuration
 */
export class SubscriptionService {
  /**
   * Get tier configuration
   */
  static getTierConfig(tier: SubscriptionTier): TierConfig {
    return TIER_CONFIGS[tier];
  }

  /**
   * Get all tier configurations
   */
  static getAllTierConfigs(): TierConfig[] {
    return Object.values(TIER_CONFIGS);
  }

  /**
   * Get complete subscription status for a training center
   */
  static async getSubscriptionDetails(
    trainingCenterId: number
  ): Promise<ServiceResponse<SubscriptionStatus>> {
    try {
      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return {
          success: false,
          error: 'Centre de formation non trouvé',
          code: 'CENTER_NOT_FOUND',
        };
      }

      const effectiveLimit = await this.getEffectiveContactLimit(trainingCenterId);
      const shouldReset = await this.shouldResetContactPeriod(trainingCenterId);
      
      // Calculate period dates
      let periodStartDate = center.firstAcceptedContactDate;
      let periodEndDate: Date | null = null;
      let daysUntilReset: number | null = null;

      if (periodStartDate) {
        periodEndDate = new Date(periodStartDate);
        periodEndDate.setDate(periodEndDate.getDate() + 30);
        
        const now = new Date();
        const msUntilReset = periodEndDate.getTime() - now.getTime();
        daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
        
        if (daysUntilReset < 0) daysUntilReset = 0;
      }

      const contactsUsed = shouldReset ? 0 : (center.contactsUsedCurrentPeriod || 0);
      const contactsRemaining = Math.max(0, effectiveLimit - contactsUsed);

      const status: SubscriptionStatus = {
        tier: center.subscriptionTier as SubscriptionTier,
        contactsLimit: effectiveLimit,
        contactsUsed,
        contactsRemaining,
        periodStartDate,
        periodEndDate,
        daysUntilReset,
        isAtLimit: contactsUsed >= effectiveLimit,
        hasPremiumAccess: this.hasPremiumAccess(center),
        premiumAccessExpiresAt: center.premiumAccessGrantedUntil,
        hasManualOverride: this.hasManualOverride(center),
        manualOverrideLimit: center.manualContactLimitOverride,
        manualOverrideExpiresAt: center.manualLimitOverrideExpires,
      };

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des détails de l\'abonnement',
        code: 'SUBSCRIPTION_DETAILS_ERROR',
      };
    }
  }

  /**
   * Get effective contact limit considering overrides and premium access
   * Priority: Premium Access > Manual Override > Tier Limit
   */
  static async getEffectiveContactLimit(trainingCenterId: number): Promise<number> {
    try {
      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return 1; // Default to gratuit limit
      }

      // Check premium access first (highest priority)
      if (this.hasPremiumAccess(center)) {
        return TIER_CONFIGS.pro.contactLimit; // 15 contacts
      }

      // Check manual override (second priority)
      if (this.hasManualOverride(center)) {
        return center.manualContactLimitOverride!;
      }

      // Return tier-based limit (default)
      return center.contactsLimit || TIER_CONFIGS.gratuit.contactLimit;
    } catch (error) {
      console.error('Error getting effective contact limit:', error);
      return 1; // Fail safe to gratuit limit
    }
  }

  /**
   * Check if contact period should reset (30 days passed)
   */
  static async shouldResetContactPeriod(trainingCenterId: number): Promise<boolean> {
    try {
      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center || !center.firstAcceptedContactDate) {
        return false; // No contacts yet, nothing to reset
      }

      const firstContactDate = new Date(center.firstAcceptedContactDate);
      const now = new Date();
      const daysSinceFirstContact = Math.floor(
        (now.getTime() - firstContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceFirstContact >= 30;
    } catch (error) {
      console.error('Error checking if period should reset:', error);
      return false;
    }
  }

  /**
   * Reset contact period (called automatically when 30 days passed)
   */
  static async resetContactPeriod(
    trainingCenterId: number,
    performedBy?: number
  ): Promise<ServiceResponse<void>> {
    try {
      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return {
          success: false,
          error: 'Centre de formation non trouvé',
          code: 'CENTER_NOT_FOUND',
        };
      }

      const contactsUsedBefore = center.contactsUsedCurrentPeriod || 0;

      // Reset the counter
      await db
        .update(trainingCenters)
        .set({
          contactsUsedCurrentPeriod: 0,
          firstAcceptedContactDate: null,
          lastContactResetDate: new Date(),
        })
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the reset in history
      await this.logContactLimitEvent(trainingCenterId, {
        eventType: 'limit_reset',
        contactsUsedBefore,
        contactsUsedAfter: 0,
        contactsLimitBefore: center.contactsLimit || 1,
        contactsLimitAfter: center.contactsLimit || 1,
        performedBy,
        reason: 'Réinitialisation automatique après 30 jours',
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting contact period:', error);
      return {
        success: false,
        error: 'Erreur lors de la réinitialisation de la période',
        code: 'RESET_PERIOD_ERROR',
      };
    }
  }

  /**
   * Upgrade or downgrade subscription tier
   * Note: In MVP, this is admin-only. With Stripe, this will handle payment flow.
   */
  static async changeTier(params: ChangeTierParams): Promise<ServiceResponse<void>> {
    try {
      const { trainingCenterId, newTier, performedBy, reason } = params;

      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return {
          success: false,
          error: 'Centre de formation non trouvé',
          code: 'CENTER_NOT_FOUND',
        };
      }

      const oldTier = center.subscriptionTier as SubscriptionTier;
      const newConfig = TIER_CONFIGS[newTier];

      // Update tier and limit
      await db
        .update(trainingCenters)
        .set({
          subscriptionTier: newTier,
          contactsLimit: newConfig.contactLimit,
          subscriptionStartDate: new Date(),
        })
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the tier change
      const eventType = newConfig.contactLimit > TIER_CONFIGS[oldTier].contactLimit
        ? 'tier_upgrade'
        : 'tier_downgrade';

      await this.logContactLimitEvent(trainingCenterId, {
        eventType,
        contactsUsedBefore: center.contactsUsedCurrentPeriod || 0,
        contactsUsedAfter: center.contactsUsedCurrentPeriod || 0,
        contactsLimitBefore: center.contactsLimit || 1,
        contactsLimitAfter: newConfig.contactLimit,
        subscriptionTierBefore: oldTier,
        subscriptionTierAfter: newTier,
        performedBy,
        reason: reason || `Changement de ${oldTier} à ${newTier}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error changing tier:', error);
      return {
        success: false,
        error: 'Erreur lors du changement de forfait',
        code: 'CHANGE_TIER_ERROR',
      };
    }
  }

  /**
   * Grant temporary premium access (admin only)
   */
  static async grantPremiumAccess(
    params: GrantPremiumAccessParams
  ): Promise<ServiceResponse<void>> {
    try {
      const { trainingCenterId, expiresAt, reason, grantedBy } = params;

      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return {
          success: false,
          error: 'Centre de formation non trouvé',
          code: 'CENTER_NOT_FOUND',
        };
      }

      // Grant premium access
      await db
        .update(trainingCenters)
        .set({
          premiumAccessGrantedUntil: expiresAt,
          premiumAccessGrantedBy: grantedBy,
          premiumAccessReason: reason,
        })
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the grant
      await this.logContactLimitEvent(trainingCenterId, {
        eventType: 'premium_access_granted',
        contactsUsedBefore: center.contactsUsedCurrentPeriod || 0,
        contactsUsedAfter: center.contactsUsedCurrentPeriod || 0,
        contactsLimitBefore: center.contactsLimit || 1,
        contactsLimitAfter: TIER_CONFIGS.pro.contactLimit,
        performedBy: grantedBy,
        reason,
        metadata: { expiresAt: expiresAt.toISOString() },
      });

      return { success: true };
    } catch (error) {
      console.error('Error granting premium access:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'attribution de l\'accès premium',
        code: 'GRANT_PREMIUM_ERROR',
      };
    }
  }

  /**
   * Set manual contact limit override (admin only)
   */
  static async setManualLimitOverride(
    params: SetManualLimitParams
  ): Promise<ServiceResponse<void>> {
    try {
      const { trainingCenterId, newLimit, reason, expiresAt, performedBy } = params;

      const center = await db.query.trainingCenters.findFirst({
        where: eq(trainingCenters.id, trainingCenterId),
      });

      if (!center) {
        return {
          success: false,
          error: 'Centre de formation non trouvé',
          code: 'CENTER_NOT_FOUND',
        };
      }

      // Set override
      await db
        .update(trainingCenters)
        .set({
          manualContactLimitOverride: newLimit,
          manualLimitOverrideReason: reason,
          manualLimitOverrideExpires: expiresAt || null,
        })
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the override
      await this.logContactLimitEvent(trainingCenterId, {
        eventType: 'manual_adjustment',
        contactsUsedBefore: center.contactsUsedCurrentPeriod || 0,
        contactsUsedAfter: center.contactsUsedCurrentPeriod || 0,
        contactsLimitBefore: center.contactsLimit || 1,
        contactsLimitAfter: newLimit,
        performedBy,
        reason,
        metadata: expiresAt ? { expiresAt: expiresAt.toISOString() } : undefined,
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting manual limit override:', error);
      return {
        success: false,
        error: 'Erreur lors de la définition de la limite manuelle',
        code: 'SET_MANUAL_LIMIT_ERROR',
      };
    }
  }

  /**
   * Log contact limit event to history (audit trail)
   */
  private static async logContactLimitEvent(
    trainingCenterId: number,
    entry: ContactLimitHistoryEntry
  ): Promise<void> {
    try {
      await db.insert(contactLimitHistory).values({
        trainingCenterId,
        eventType: entry.eventType,
        contactsUsedBefore: entry.contactsUsedBefore,
        contactsUsedAfter: entry.contactsUsedAfter,
        contactsLimitBefore: entry.contactsLimitBefore,
        contactsLimitAfter: entry.contactsLimitAfter,
        subscriptionTierBefore: entry.subscriptionTierBefore,
        subscriptionTierAfter: entry.subscriptionTierAfter,
        performedBy: entry.performedBy,
        reason: entry.reason,
        metadata: entry.metadata,
      });
    } catch (error) {
      console.error('Error logging contact limit event:', error);
      // Don't throw - logging failure shouldn't break the main operation
    }
  }

  /**
   * Check if center has active premium access
   */
  private static hasPremiumAccess(center: any): boolean {
    if (!center.premiumAccessGrantedUntil) return false;
    return new Date(center.premiumAccessGrantedUntil) > new Date();
  }

  /**
   * Check if center has active manual override
   */
  private static hasManualOverride(center: any): boolean {
    if (!center.manualContactLimitOverride) return false;
    if (!center.manualLimitOverrideExpires) return true; // No expiration
    return new Date(center.manualLimitOverrideExpires) > new Date();
  }
}
