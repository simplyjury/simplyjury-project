# Epic 07 - Step 02: Backend Services & Business Logic

## 🎯 Objective
Create backend services to manage subscription tiers, contact limits, and waiting list functionality.

---

## 📁 File Structure

```
lib/
├── services/
│   ├── subscription-service.ts          # Main subscription management
│   ├── contact-limit-service.ts         # Contact limit tracking & validation
│   └── waiting-list-service.ts          # Waiting list management
├── utils/
│   └── subscription-helpers.ts          # Helper functions for tier logic
```

---

## 1️⃣ Subscription Service

**File: `lib/services/subscription-service.ts`**

```typescript
import { db } from '@/lib/db/drizzle';
import { trainingCenters, contactLimitHistory } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export interface SubscriptionTierConfig {
  tier: 'gratuit' | 'basic' | 'pro';
  contactLimit: number;
  features: string[];
  price: number;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTierConfig> = {
  gratuit: {
    tier: 'gratuit',
    contactLimit: 1,
    features: [
      '1 jury pour tester',
      'Messagerie pour 1 mission',
      'Support par email',
      'Visibilité standard'
    ],
    price: 0
  },
  basic: {
    tier: 'basic',
    contactLimit: 5,
    features: [
      "Jusqu'à 5 jurys par mois",
      'Messagerie complète',
      'Support par email',
      'Tableau de bord simplifié',
      'Visibilité standard'
    ],
    price: 39
  },
  pro: {
    tier: 'pro',
    contactLimit: 15,
    features: [
      "Jusqu'à 15 jurys par mois",
      'Tableau de bord complet',
      'Gestion des certifications',
      'Suivi et traçabilité des missions',
      'Support prioritaire',
      'Exports (Excel, PDF)',
      'Badge "OF Pro vérifié"',
      'Visibilité prioritaire'
    ],
    price: 89
  }
};

export class SubscriptionService {
  /**
   * Get current subscription details for a training center
   */
  static async getSubscriptionDetails(trainingCenterId: number) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
      columns: {
        id: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        contactsUsedCurrentPeriod: true,
        contactsLimit: true,
        firstAcceptedContactDate: true,
        lastContactResetDate: true,
        manualContactLimitOverride: true,
        manualLimitOverrideExpires: true,
        premiumAccessGrantedUntil: true,
      }
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    const effectiveLimit = await this.getEffectiveContactLimit(trainingCenterId);
    const contactsRemaining = Math.max(0, effectiveLimit - (center.contactsUsedCurrentPeriod || 0));
    const isPremiumAccess = center.premiumAccessGrantedUntil && new Date(center.premiumAccessGrantedUntil) > new Date();
    const hasManualOverride = center.manualContactLimitOverride !== null && 
      (!center.manualLimitOverrideExpires || new Date(center.manualLimitOverrideExpires) > new Date());

    return {
      ...center,
      effectiveLimit,
      contactsRemaining,
      isPremiumAccess,
      hasManualOverride,
      tierConfig: SUBSCRIPTION_TIERS[center.subscriptionTier || 'gratuit'],
      needsReset: await this.shouldResetContactPeriod(trainingCenterId),
    };
  }

  /**
   * Get effective contact limit (considering overrides and premium access)
   */
  static async getEffectiveContactLimit(trainingCenterId: number): Promise<number> {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
      columns: {
        subscriptionTier: true,
        contactsLimit: true,
        manualContactLimitOverride: true,
        manualLimitOverrideExpires: true,
        premiumAccessGrantedUntil: true,
      }
    });

    if (!center) {
      return 1; // Default to free tier
    }

    // Check premium access
    if (center.premiumAccessGrantedUntil && new Date(center.premiumAccessGrantedUntil) > new Date()) {
      return SUBSCRIPTION_TIERS.pro.contactLimit;
    }

    // Check manual override
    if (center.manualContactLimitOverride !== null) {
      if (!center.manualLimitOverrideExpires || new Date(center.manualLimitOverrideExpires) > new Date()) {
        return center.manualContactLimitOverride;
      }
    }

    // Return tier-based limit
    return center.contactsLimit || SUBSCRIPTION_TIERS[center.subscriptionTier || 'gratuit'].contactLimit;
  }

  /**
   * Check if contact period should reset (30-day rolling window)
   */
  static async shouldResetContactPeriod(trainingCenterId: number): Promise<boolean> {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
      columns: {
        firstAcceptedContactDate: true,
      }
    });

    if (!center || !center.firstAcceptedContactDate) {
      return false; // No contacts yet
    }

    const daysSinceFirstContact = Math.floor(
      (Date.now() - new Date(center.firstAcceptedContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceFirstContact >= 30;
  }

  /**
   * Reset contact period (called automatically when 30 days pass)
   */
  static async resetContactPeriod(trainingCenterId: number, performedBy?: number) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    // Log the reset
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      eventType: 'limit_reset',
      contactsUsedBefore: center.contactsUsedCurrentPeriod || 0,
      contactsUsedAfter: 0,
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: center.contactsLimit,
      performedBy,
      reason: '30-day period reset',
      metadata: {
        previousPeriodStart: center.firstAcceptedContactDate,
        previousPeriodEnd: new Date(),
      }
    });

    // Reset the counter
    await db.update(trainingCenters)
      .set({
        contactsUsedCurrentPeriod: 0,
        lastContactResetDate: new Date(),
        firstAcceptedContactDate: null,
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.id, trainingCenterId));

    return { success: true, message: 'Contact period reset successfully' };
  }

  /**
   * Upgrade subscription tier (for future use when Stripe is integrated)
   */
  static async upgradeTier(
    trainingCenterId: number,
    newTier: 'basic' | 'pro',
    performedBy?: number
  ) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    const oldTier = center.subscriptionTier || 'gratuit';
    const newLimit = SUBSCRIPTION_TIERS[newTier].contactLimit;

    // Log the upgrade
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      eventType: 'tier_upgrade',
      contactsUsedBefore: center.contactsUsedCurrentPeriod,
      contactsUsedAfter: center.contactsUsedCurrentPeriod,
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: newLimit,
      subscriptionTierBefore: oldTier,
      subscriptionTierAfter: newTier,
      performedBy,
      reason: `Upgraded from ${oldTier} to ${newTier}`,
    });

    // Update the tier
    await db.update(trainingCenters)
      .set({
        subscriptionTier: newTier,
        contactsLimit: newLimit,
        subscriptionStartDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.id, trainingCenterId));

    return { success: true, message: `Upgraded to ${newTier} tier` };
  }

  /**
   * Grant temporary premium access (admin function)
   */
  static async grantPremiumAccess(
    trainingCenterId: number,
    expiresAt: Date,
    reason: string,
    grantedBy: number
  ) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    // Log the grant
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      eventType: 'premium_access_granted',
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: SUBSCRIPTION_TIERS.pro.contactLimit,
      performedBy: grantedBy,
      reason,
      metadata: {
        expiresAt,
      }
    });

    // Grant access
    await db.update(trainingCenters)
      .set({
        premiumAccessGrantedUntil: expiresAt,
        premiumAccessGrantedBy: grantedBy,
        premiumAccessReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.id, trainingCenterId));

    return { success: true, message: 'Premium access granted' };
  }

  /**
   * Set manual contact limit override (admin function)
   */
  static async setManualLimitOverride(
    trainingCenterId: number,
    newLimit: number,
    reason: string,
    expiresAt: Date | null,
    performedBy: number
  ) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    // Log the override
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      eventType: 'manual_adjustment',
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: newLimit,
      performedBy,
      reason,
      metadata: {
        expiresAt,
      }
    });

    // Set override
    await db.update(trainingCenters)
      .set({
        manualContactLimitOverride: newLimit,
        manualLimitOverrideReason: reason,
        manualLimitOverrideExpires: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.id, trainingCenterId));

    return { success: true, message: 'Manual limit override set' };
  }
}
```

---

## 2️⃣ Contact Limit Service

**File: `lib/services/contact-limit-service.ts`**

```typescript
import { db } from '@/lib/db/drizzle';
import { trainingCenters, juryRequests, contactLimitHistory } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { SubscriptionService } from './subscription-service';

export class ContactLimitService {
  /**
   * Check if center can contact a jury (has remaining contacts)
   */
  static async canContactJury(trainingCenterId: number): Promise<{
    canContact: boolean;
    reason?: string;
    contactsRemaining: number;
    effectiveLimit: number;
    contactsUsed: number;
  }> {
    // Check if period needs reset first
    const needsReset = await SubscriptionService.shouldResetContactPeriod(trainingCenterId);
    if (needsReset) {
      await SubscriptionService.resetContactPeriod(trainingCenterId);
    }

    const subscription = await SubscriptionService.getSubscriptionDetails(trainingCenterId);
    
    const canContact = subscription.contactsRemaining > 0;
    
    return {
      canContact,
      reason: canContact ? undefined : 'Limite de contacts atteinte pour cette période',
      contactsRemaining: subscription.contactsRemaining,
      effectiveLimit: subscription.effectiveLimit,
      contactsUsed: subscription.contactsUsedCurrentPeriod || 0,
    };
  }

  /**
   * Increment contact usage when a jury accepts a request
   * This is the ONLY way contacts are counted (on acceptance, not on request)
   */
  static async incrementContactUsage(
    trainingCenterId: number,
    juryRequestId: number
  ) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    const currentUsed = center.contactsUsedCurrentPeriod || 0;
    const newUsed = currentUsed + 1;

    // If this is the first accepted contact, set the start date for the 30-day window
    const updates: any = {
      contactsUsedCurrentPeriod: newUsed,
      updatedAt: new Date(),
    };

    if (!center.firstAcceptedContactDate) {
      updates.firstAcceptedContactDate = new Date();
    }

    // Log the contact usage
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      juryRequestId,
      eventType: 'contact_used',
      contactsUsedBefore: currentUsed,
      contactsUsedAfter: newUsed,
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: center.contactsLimit,
      reason: 'Jury accepted request',
    });

    // Update the counter
    await db.update(trainingCenters)
      .set(updates)
      .where(eq(trainingCenters.id, trainingCenterId));

    return {
      success: true,
      contactsUsed: newUsed,
      contactsRemaining: (await SubscriptionService.getEffectiveContactLimit(trainingCenterId)) - newUsed,
    };
  }

  /**
   * Refund a contact (admin function - for mistakes, disputes, etc.)
   */
  static async refundContact(
    trainingCenterId: number,
    juryRequestId: number,
    reason: string,
    performedBy: number
  ) {
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.id, trainingCenterId),
    });

    if (!center) {
      throw new Error('Training center not found');
    }

    const currentUsed = center.contactsUsedCurrentPeriod || 0;
    if (currentUsed === 0) {
      throw new Error('No contacts to refund');
    }

    const newUsed = currentUsed - 1;

    // Log the refund
    await db.insert(contactLimitHistory).values({
      trainingCenterId,
      juryRequestId,
      eventType: 'contact_refunded',
      contactsUsedBefore: currentUsed,
      contactsUsedAfter: newUsed,
      contactsLimitBefore: center.contactsLimit,
      contactsLimitAfter: center.contactsLimit,
      performedBy,
      reason,
    });

    // Update the counter
    await db.update(trainingCenters)
      .set({
        contactsUsedCurrentPeriod: newUsed,
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.id, trainingCenterId));

    return {
      success: true,
      message: 'Contact refunded successfully',
      contactsUsed: newUsed,
    };
  }

  /**
   * Get contact usage statistics for a center
   */
  static async getContactStats(trainingCenterId: number) {
    const subscription = await SubscriptionService.getSubscriptionDetails(trainingCenterId);
    
    // Get history for current period
    const periodStart = subscription.firstAcceptedContactDate || new Date();
    const history = await db.query.contactLimitHistory.findMany({
      where: and(
        eq(contactLimitHistory.trainingCenterId, trainingCenterId),
        gte(contactLimitHistory.createdAt, periodStart)
      ),
      orderBy: (history, { desc }) => [desc(history.createdAt)],
    });

    // Get total accepted requests (all time)
    const totalAcceptedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(juryRequests)
      .where(
        and(
          eq(juryRequests.trainingCenterId, trainingCenterId),
          eq(juryRequests.status, 'accepted')
        )
      );

    const totalAccepted = totalAcceptedResult[0]?.count || 0;

    return {
      currentPeriod: {
        contactsUsed: subscription.contactsUsedCurrentPeriod || 0,
        contactsRemaining: subscription.contactsRemaining,
        effectiveLimit: subscription.effectiveLimit,
        periodStart: subscription.firstAcceptedContactDate,
        periodEnd: subscription.firstAcceptedContactDate 
          ? new Date(new Date(subscription.firstAcceptedContactDate).getTime() + 30 * 24 * 60 * 60 * 1000)
          : null,
      },
      allTime: {
        totalAccepted,
      },
      subscription: {
        tier: subscription.subscriptionTier,
        tierConfig: subscription.tierConfig,
        isPremiumAccess: subscription.isPremiumAccess,
        hasManualOverride: subscription.hasManualOverride,
      },
      recentHistory: history.slice(0, 10), // Last 10 events
    };
  }
}
```

---

## 3️⃣ Waiting List Service

**File: `lib/services/waiting-list-service.ts`**

```typescript
import { db } from '@/lib/db/drizzle';
import { subscriptionWaitingList, users, trainingCenters } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface WaitingListEntry {
  email: string;
  desiredTier: 'basic' | 'pro';
  triggeredBy?: 'limit_reached' | 'pricing_page' | 'dashboard_cta' | 'manual';
  currentContactsUsed?: number;
}

export class WaitingListService {
  /**
   * Add user to waiting list
   */
  static async addToWaitingList(
    entry: WaitingListEntry,
    userId?: number,
    trainingCenterId?: number
  ) {
    try {
      // Check if already on waiting list for this tier
      const existing = await db.query.subscriptionWaitingList.findFirst({
        where: and(
          eq(subscriptionWaitingList.email, entry.email),
          eq(subscriptionWaitingList.desiredTier, entry.desiredTier)
        ),
      });

      if (existing) {
        // Update if status is declined or pending
        if (existing.status === 'declined' || existing.status === 'pending') {
          await db.update(subscriptionWaitingList)
            .set({
              status: 'pending',
              triggeredBy: entry.triggeredBy,
              currentContactsUsed: entry.currentContactsUsed,
              updatedAt: new Date(),
            })
            .where(eq(subscriptionWaitingList.id, existing.id));

          return {
            success: true,
            message: 'Votre intérêt a été mis à jour',
            isNew: false,
          };
        }

        return {
          success: false,
          message: 'Vous êtes déjà sur la liste d\'attente pour ce plan',
          isNew: false,
        };
      }

      // Add new entry
      await db.insert(subscriptionWaitingList).values({
        email: entry.email,
        userId,
        trainingCenterId,
        desiredTier: entry.desiredTier,
        triggeredBy: entry.triggeredBy,
        currentContactsUsed: entry.currentContactsUsed,
        status: 'pending',
      });

      return {
        success: true,
        message: 'Vous avez été ajouté à la liste d\'attente',
        isNew: true,
      };
    } catch (error) {
      console.error('Error adding to waiting list:', error);
      throw new Error('Failed to add to waiting list');
    }
  }

  /**
   * Get waiting list entries (admin function)
   */
  static async getWaitingList(filters?: {
    status?: string;
    desiredTier?: string;
    limit?: number;
  }) {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(subscriptionWaitingList.status, filters.status));
    }
    
    if (filters?.desiredTier) {
      conditions.push(eq(subscriptionWaitingList.desiredTier, filters.desiredTier));
    }

    const entries = await db.query.subscriptionWaitingList.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(subscriptionWaitingList.createdAt)],
      limit: filters?.limit || 100,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            userType: true,
          }
        },
        trainingCenter: {
          columns: {
            id: true,
            name: true,
            subscriptionTier: true,
          }
        }
      }
    });

    return entries;
  }

  /**
   * Mark waiting list entry as contacted (admin function)
   */
  static async markAsContacted(
    entryId: number,
    contactedBy: number,
    notes?: string
  ) {
    await db.update(subscriptionWaitingList)
      .set({
        status: 'contacted',
        contactedAt: new Date(),
        contactedBy,
        contactNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionWaitingList.id, entryId));

    return { success: true, message: 'Entry marked as contacted' };
  }

  /**
   * Mark waiting list entry as converted (when they subscribe)
   */
  static async markAsConverted(entryId: number) {
    await db.update(subscriptionWaitingList)
      .set({
        status: 'converted',
        convertedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionWaitingList.id, entryId));

    return { success: true, message: 'Entry marked as converted' };
  }

  /**
   * Get waiting list statistics (admin dashboard)
   */
  static async getWaitingListStats() {
    const allEntries = await db.query.subscriptionWaitingList.findMany();

    const stats = {
      total: allEntries.length,
      byStatus: {
        pending: allEntries.filter(e => e.status === 'pending').length,
        contacted: allEntries.filter(e => e.status === 'contacted').length,
        converted: allEntries.filter(e => e.status === 'converted').length,
        declined: allEntries.filter(e => e.status === 'declined').length,
      },
      byTier: {
        basic: allEntries.filter(e => e.desiredTier === 'basic').length,
        pro: allEntries.filter(e => e.desiredTier === 'pro').length,
      },
      byTrigger: {
        limit_reached: allEntries.filter(e => e.triggeredBy === 'limit_reached').length,
        pricing_page: allEntries.filter(e => e.triggeredBy === 'pricing_page').length,
        dashboard_cta: allEntries.filter(e => e.triggeredBy === 'dashboard_cta').length,
        manual: allEntries.filter(e => e.triggeredBy === 'manual').length,
      },
      conversionRate: allEntries.length > 0 
        ? (stats.byStatus.converted / allEntries.length * 100).toFixed(2)
        : 0,
    };

    return stats;
  }
}
```

---

## 4️⃣ Helper Utilities

**File: `lib/utils/subscription-helpers.ts`**

```typescript
import { SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service';

/**
 * Format subscription tier for display
 */
export function formatTierName(tier: string): string {
  const names: Record<string, string> = {
    gratuit: 'Gratuit',
    basic: 'Basic',
    pro: 'Pro',
  };
  return names[tier] || tier;
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: string): string {
  const colors: Record<string, string> = {
    gratuit: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-orange-100 text-orange-800',
  };
  return colors[tier] || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate days remaining in current period
 */
export function getDaysRemainingInPeriod(firstAcceptedContactDate: Date | null): number {
  if (!firstAcceptedContactDate) {
    return 30; // Full period available
  }

  const periodEndDate = new Date(firstAcceptedContactDate);
  periodEndDate.setDate(periodEndDate.getDate() + 30);

  const daysRemaining = Math.ceil(
    (periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysRemaining);
}

/**
 * Format period end date
 */
export function formatPeriodEndDate(firstAcceptedContactDate: Date | null): string {
  if (!firstAcceptedContactDate) {
    return 'Pas encore commencé';
  }

  const periodEndDate = new Date(firstAcceptedContactDate);
  periodEndDate.setDate(periodEndDate.getDate() + 30);

  return periodEndDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if user should see upgrade prompt
 */
export function shouldShowUpgradePrompt(
  contactsRemaining: number,
  tier: string
): boolean {
  // Show upgrade prompt when:
  // 1. On free tier and no contacts remaining
  // 2. On basic tier and less than 2 contacts remaining
  if (tier === 'gratuit' && contactsRemaining === 0) {
    return true;
  }
  
  if (tier === 'basic' && contactsRemaining <= 1) {
    return true;
  }

  return false;
}

/**
 * Get recommended upgrade tier
 */
export function getRecommendedUpgradeTier(currentTier: string): 'basic' | 'pro' {
  if (currentTier === 'gratuit') {
    return 'basic';
  }
  return 'pro';
}
```

---

## ✅ Testing Checklist

### Unit Tests to Create:

- [ ] `SubscriptionService.getEffectiveContactLimit()` with various scenarios
- [ ] `SubscriptionService.shouldResetContactPeriod()` edge cases
- [ ] `ContactLimitService.canContactJury()` validation logic
- [ ] `ContactLimitService.incrementContactUsage()` counter updates
- [ ] `WaitingListService.addToWaitingList()` duplicate handling
- [ ] Helper functions for date calculations

### Integration Tests:

- [ ] Full flow: Send request → Jury accepts → Counter increments
- [ ] Period reset after 30 days
- [ ] Admin override scenarios
- [ ] Premium access expiration
- [ ] Waiting list entry creation and updates

---

## 🚀 Next Steps

After completing this step:
1. Create all service files
2. Write unit tests for critical functions
3. Test with sample data in dev database
4. Proceed to **Step 03: API Routes**
