// Epic 07 - Contact Limit Service
// Handles contact usage tracking, limit checks, and refunds

import { db } from '@/lib/db/drizzle';
import { trainingCenters, contactLimitHistory } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { SubscriptionService } from './subscription-service';
import type {
  CanContactResult,
  ContactStats,
  RefundContactParams,
  ServiceResponse,
  SubscriptionTier,
} from '@/lib/types/subscription';

export class ContactLimitService {
  /**
   * Check if a training center can contact a jury
   * This is the main gate-keeping function called before allowing a request
   */
  static async canContactJury(
    trainingCenterId: number
  ): Promise<ServiceResponse<CanContactResult>> {
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

      // Check if period should reset first
      const shouldReset = await SubscriptionService.shouldResetContactPeriod(trainingCenterId);
      if (shouldReset) {
        await SubscriptionService.resetContactPeriod(trainingCenterId);
        // After reset, they can contact
        const effectiveLimit = await SubscriptionService.getEffectiveContactLimit(trainingCenterId);
        return {
          success: true,
          data: {
            canContact: true,
            contactsRemaining: effectiveLimit,
            needsUpgrade: false,
          },
        };
      }

      // Get current usage and limits
      const effectiveLimit = await SubscriptionService.getEffectiveContactLimit(trainingCenterId);
      const contactsUsed = center.contactsUsedCurrentPeriod || 0;
      const contactsRemaining = Math.max(0, effectiveLimit - contactsUsed);

      // Check if at limit
      if (contactsUsed >= effectiveLimit) {
        const suggestedTier = this.getSuggestedUpgradeTier(center.subscriptionTier as SubscriptionTier);
        
        return {
          success: true,
          data: {
            canContact: false,
            reason: 'Limite de contacts atteinte pour cette période',
            contactsRemaining: 0,
            needsUpgrade: true,
            suggestedTier,
          },
        };
      }

      // Can contact
      return {
        success: true,
        data: {
          canContact: true,
          contactsRemaining,
          needsUpgrade: false,
        },
      };
    } catch (error) {
      console.error('Error checking if can contact jury:', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification de la limite de contacts',
        code: 'CAN_CONTACT_CHECK_ERROR',
      };
    }
  }

  /**
   * Increment contact usage when a jury accepts a request
   * This is called from the jury request response API
   */
  static async incrementContactUsage(
    trainingCenterId: number,
    juryRequestId: number
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
      const contactsUsedAfter = contactsUsedBefore + 1;
      const effectiveLimit = await SubscriptionService.getEffectiveContactLimit(trainingCenterId);

      // Set first contact date if this is the first contact
      const updateData: any = {
        contactsUsedCurrentPeriod: contactsUsedAfter,
      };

      if (!center.firstAcceptedContactDate) {
        updateData.firstAcceptedContactDate = new Date();
      }

      // Update the counter
      await db
        .update(trainingCenters)
        .set(updateData)
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the usage
      await db.insert(contactLimitHistory).values({
        trainingCenterId,
        juryRequestId,
        eventType: 'contact_used',
        contactsUsedBefore,
        contactsUsedAfter,
        contactsLimitBefore: effectiveLimit,
        contactsLimitAfter: effectiveLimit,
        reason: 'Jury a accepté la demande',
      });

      return { success: true };
    } catch (error) {
      console.error('Error incrementing contact usage:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'incrémentation de l\'utilisation des contacts',
        code: 'INCREMENT_USAGE_ERROR',
      };
    }
  }

  /**
   * Refund a contact (admin only)
   * Used when there's an error or dispute
   */
  static async refundContact(
    params: RefundContactParams
  ): Promise<ServiceResponse<void>> {
    try {
      const { trainingCenterId, juryRequestId, reason, performedBy } = params;

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

      // Can't refund if no contacts used
      if (contactsUsedBefore === 0) {
        return {
          success: false,
          error: 'Aucun contact à rembourser',
          code: 'NO_CONTACTS_TO_REFUND',
        };
      }

      const contactsUsedAfter = Math.max(0, contactsUsedBefore - 1);
      const effectiveLimit = await SubscriptionService.getEffectiveContactLimit(trainingCenterId);

      // Decrement the counter
      await db
        .update(trainingCenters)
        .set({
          contactsUsedCurrentPeriod: contactsUsedAfter,
        })
        .where(eq(trainingCenters.id, trainingCenterId));

      // Log the refund
      await db.insert(contactLimitHistory).values({
        trainingCenterId,
        juryRequestId,
        eventType: 'contact_refunded',
        contactsUsedBefore,
        contactsUsedAfter,
        contactsLimitBefore: effectiveLimit,
        contactsLimitAfter: effectiveLimit,
        performedBy,
        reason,
      });

      return { success: true };
    } catch (error) {
      console.error('Error refunding contact:', error);
      return {
        success: false,
        error: 'Erreur lors du remboursement du contact',
        code: 'REFUND_CONTACT_ERROR',
      };
    }
  }

  /**
   * Get detailed contact usage statistics
   */
  static async getContactStats(
    trainingCenterId: number
  ): Promise<ServiceResponse<ContactStats>> {
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

      const effectiveLimit = await SubscriptionService.getEffectiveContactLimit(trainingCenterId);
      const contactsUsed = center.contactsUsedCurrentPeriod || 0;
      const contactsRemaining = Math.max(0, effectiveLimit - contactsUsed);

      // Calculate period dates
      let periodStartDate = center.firstAcceptedContactDate;
      let periodEndDate: Date | null = null;

      if (periodStartDate) {
        periodEndDate = new Date(periodStartDate);
        periodEndDate.setDate(periodEndDate.getDate() + 30);
      }

      // Get history stats
      const historyStats = await this.getHistoryStats(trainingCenterId);

      // Get recent activity (last 5 contacts)
      const recentActivity = await this.getRecentActivity(trainingCenterId);

      const stats: ContactStats = {
        currentPeriod: {
          used: contactsUsed,
          limit: effectiveLimit,
          remaining: contactsRemaining,
          startDate: periodStartDate,
          endDate: periodEndDate,
        },
        history: historyStats,
        recentActivity,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error getting contact stats:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        code: 'GET_STATS_ERROR',
      };
    }
  }

  /**
   * Get historical statistics
   */
  private static async getHistoryStats(trainingCenterId: number): Promise<{
    totalContactsAllTime: number;
    averagePerPeriod: number;
    periodsCompleted: number;
  }> {
    try {
      // Count all contact_used events
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactLimitHistory)
        .where(
          and(
            eq(contactLimitHistory.trainingCenterId, trainingCenterId),
            eq(contactLimitHistory.eventType, 'contact_used')
          )
        );

      const totalContactsAllTime = Number(totalResult[0]?.count || 0);

      // Count period resets
      const resetsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactLimitHistory)
        .where(
          and(
            eq(contactLimitHistory.trainingCenterId, trainingCenterId),
            eq(contactLimitHistory.eventType, 'limit_reset')
          )
        );

      const periodsCompleted = Number(resetsResult[0]?.count || 0);

      // Calculate average
      const averagePerPeriod = periodsCompleted > 0
        ? Math.round(totalContactsAllTime / (periodsCompleted + 1)) // +1 for current period
        : totalContactsAllTime;

      return {
        totalContactsAllTime,
        averagePerPeriod,
        periodsCompleted,
      };
    } catch (error) {
      console.error('Error getting history stats:', error);
      return {
        totalContactsAllTime: 0,
        averagePerPeriod: 0,
        periodsCompleted: 0,
      };
    }
  }

  /**
   * Get recent contact activity
   */
  private static async getRecentActivity(trainingCenterId: number): Promise<Array<{
    date: Date;
    juryName: string;
    certificationTitle: string;
  }>> {
    try {
      // This would need to join with jury_requests table
      // For now, return empty array as jury_requests is not in schema yet
      // TODO: Implement when jury_requests is added to schema
      return [];
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Suggest upgrade tier based on current tier
   */
  private static getSuggestedUpgradeTier(currentTier: SubscriptionTier): SubscriptionTier {
    if (currentTier === 'gratuit') return 'basic';
    if (currentTier === 'basic') return 'pro';
    return 'pro'; // Already at highest tier
  }
}
