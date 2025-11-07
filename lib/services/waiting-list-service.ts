// Epic 07 - Waiting List Service
// Handles waiting list for paid subscriptions (MVP phase before Stripe integration)

import { db } from '@/lib/db/drizzle';
import { subscriptionWaitingList, trainingCenters } from '@/lib/db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import type {
  WaitingListEntry,
  WaitingListStats,
  WaitingListStatus,
  ServiceResponse,
} from '@/lib/types/subscription';

export class WaitingListService {
  /**
   * Add a user to the waiting list
   * Called when user hits contact limit or clicks upgrade CTA
   */
  static async addToWaitingList(
    entry: WaitingListEntry,
    userId?: number,
    trainingCenterId?: number
  ): Promise<ServiceResponse<{ id: number }>> {
    try {
      const { email, desiredTier, triggeredBy, currentContactsUsed } = entry;

      // Check if already on waiting list for this tier
      const existing = await db.query.subscriptionWaitingList.findFirst({
        where: and(
          eq(subscriptionWaitingList.email, email),
          eq(subscriptionWaitingList.desiredTier, desiredTier),
          or(
            eq(subscriptionWaitingList.status, 'pending'),
            eq(subscriptionWaitingList.status, 'contacted')
          )
        ),
      });

      if (existing) {
        return {
          success: false,
          error: 'Vous êtes déjà sur la liste d\'attente pour ce forfait',
          code: 'ALREADY_ON_WAITING_LIST',
        };
      }

      // Add to waiting list
      const result = await db
        .insert(subscriptionWaitingList)
        .values({
          email,
          userId: userId || null,
          trainingCenterId: trainingCenterId || null,
          desiredTier,
          status: 'pending',
          triggeredBy: triggeredBy || null,
          currentContactsUsed: currentContactsUsed || null,
        })
        .returning({ id: subscriptionWaitingList.id });

      return {
        success: true,
        data: { id: result[0].id },
      };
    } catch (error) {
      console.error('Error adding to waiting list:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'ajout à la liste d\'attente',
        code: 'ADD_TO_WAITING_LIST_ERROR',
      };
    }
  }

  /**
   * Get waiting list entries with optional filters
   * Admin function
   */
  static async getWaitingList(filters?: {
    status?: WaitingListStatus;
    desiredTier?: 'basic' | 'pro';
    limit?: number;
    offset?: number;
  }): Promise<ServiceResponse<Array<any>>> {
    try {
      let query = db.select().from(subscriptionWaitingList);

      // Apply filters
      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(subscriptionWaitingList.status, filters.status));
      }
      if (filters?.desiredTier) {
        conditions.push(eq(subscriptionWaitingList.desiredTier, filters.desiredTier));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Order by creation date (newest first)
      query = query.orderBy(desc(subscriptionWaitingList.createdAt)) as any;

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
      }
      if (filters?.offset) {
        query = query.offset(filters.offset) as any;
      }

      const entries = await query;

      return {
        success: true,
        data: entries,
      };
    } catch (error) {
      console.error('Error getting waiting list:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération de la liste d\'attente',
        code: 'GET_WAITING_LIST_ERROR',
      };
    }
  }

  /**
   * Mark a waiting list entry as contacted
   * Admin function
   */
  static async markAsContacted(
    entryId: number,
    contactedBy: number,
    notes?: string
  ): Promise<ServiceResponse<void>> {
    try {
      await db
        .update(subscriptionWaitingList)
        .set({
          status: 'contacted',
          contactedAt: new Date(),
          contactedBy,
          contactNotes: notes || null,
        })
        .where(eq(subscriptionWaitingList.id, entryId));

      return { success: true };
    } catch (error) {
      console.error('Error marking as contacted:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
        code: 'MARK_CONTACTED_ERROR',
      };
    }
  }

  /**
   * Mark a waiting list entry as converted (subscribed)
   * Called when Stripe integration is active and user subscribes
   */
  static async markAsConverted(entryId: number): Promise<ServiceResponse<void>> {
    try {
      await db
        .update(subscriptionWaitingList)
        .set({
          status: 'converted',
          convertedAt: new Date(),
        })
        .where(eq(subscriptionWaitingList.id, entryId));

      return { success: true };
    } catch (error) {
      console.error('Error marking as converted:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
        code: 'MARK_CONVERTED_ERROR',
      };
    }
  }

  /**
   * Mark a waiting list entry as declined
   * Admin function when user is no longer interested
   */
  static async markAsDeclined(entryId: number): Promise<ServiceResponse<void>> {
    try {
      await db
        .update(subscriptionWaitingList)
        .set({
          status: 'declined',
        })
        .where(eq(subscriptionWaitingList.id, entryId));

      return { success: true };
    } catch (error) {
      console.error('Error marking as declined:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
        code: 'MARK_DECLINED_ERROR',
      };
    }
  }

  /**
   * Get waiting list statistics
   * Admin function for dashboard
   */
  static async getWaitingListStats(): Promise<ServiceResponse<WaitingListStats>> {
    try {
      // Total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptionWaitingList);
      const total = Number(totalResult[0]?.count || 0);

      // By tier
      const tierResult = await db
        .select({
          tier: subscriptionWaitingList.desiredTier,
          count: sql<number>`count(*)`,
        })
        .from(subscriptionWaitingList)
        .groupBy(subscriptionWaitingList.desiredTier);

      const byTier = {
        basic: 0,
        pro: 0,
      };
      tierResult.forEach((row) => {
        if (row.tier === 'basic') byTier.basic = Number(row.count);
        if (row.tier === 'pro') byTier.pro = Number(row.count);
      });

      // By status
      const statusResult = await db
        .select({
          status: subscriptionWaitingList.status,
          count: sql<number>`count(*)`,
        })
        .from(subscriptionWaitingList)
        .groupBy(subscriptionWaitingList.status);

      const byStatus = {
        pending: 0,
        contacted: 0,
        converted: 0,
        declined: 0,
      };
      statusResult.forEach((row) => {
        const status = row.status as WaitingListStatus;
        byStatus[status] = Number(row.count);
      });

      // By trigger
      const triggerResult = await db
        .select({
          trigger: subscriptionWaitingList.triggeredBy,
          count: sql<number>`count(*)`,
        })
        .from(subscriptionWaitingList)
        .where(sql`${subscriptionWaitingList.triggeredBy} IS NOT NULL`)
        .groupBy(subscriptionWaitingList.triggeredBy);

      const byTrigger = {
        limit_reached: 0,
        pricing_page: 0,
        dashboard_cta: 0,
        manual: 0,
      };
      triggerResult.forEach((row) => {
        const trigger = row.trigger as string;
        if (trigger in byTrigger) {
          byTrigger[trigger as keyof typeof byTrigger] = Number(row.count);
        }
      });

      // Conversion rate
      const conversionRate = byStatus.contacted > 0
        ? Math.round((byStatus.converted / byStatus.contacted) * 100)
        : 0;

      const stats: WaitingListStats = {
        total,
        byTier,
        byStatus,
        byTrigger,
        conversionRate,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error getting waiting list stats:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        code: 'GET_STATS_ERROR',
      };
    }
  }

  /**
   * Check if an email is already on the waiting list
   * Used to prevent duplicates and show appropriate messaging
   */
  static async isOnWaitingList(
    email: string,
    desiredTier?: 'basic' | 'pro'
  ): Promise<ServiceResponse<{ isOnList: boolean; status?: WaitingListStatus }>> {
    try {
      const conditions = [eq(subscriptionWaitingList.email, email)];
      
      if (desiredTier) {
        conditions.push(eq(subscriptionWaitingList.desiredTier, desiredTier));
      }

      const entry = await db.query.subscriptionWaitingList.findFirst({
        where: and(...conditions),
        orderBy: desc(subscriptionWaitingList.createdAt),
      });

      if (!entry) {
        return {
          success: true,
          data: { isOnList: false },
        };
      }

      return {
        success: true,
        data: {
          isOnList: true,
          status: entry.status as WaitingListStatus,
        },
      };
    } catch (error) {
      console.error('Error checking if on waiting list:', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification',
        code: 'CHECK_WAITING_LIST_ERROR',
      };
    }
  }

  /**
   * Get waiting list entry by email
   * Used to retrieve existing entry for a user
   */
  static async getEntryByEmail(
    email: string
  ): Promise<ServiceResponse<any>> {
    try {
      const entry = await db.query.subscriptionWaitingList.findFirst({
        where: eq(subscriptionWaitingList.email, email),
        orderBy: desc(subscriptionWaitingList.createdAt),
      });

      if (!entry) {
        return {
          success: false,
          error: 'Aucune entrée trouvée pour cet email',
          code: 'ENTRY_NOT_FOUND',
        };
      }

      return {
        success: true,
        data: entry,
      };
    } catch (error) {
      console.error('Error getting entry by email:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'entrée',
        code: 'GET_ENTRY_ERROR',
      };
    }
  }
}
