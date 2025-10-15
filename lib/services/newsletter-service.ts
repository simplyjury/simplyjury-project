import { db } from '@/lib/db/drizzle';
import { newsletterSubscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface NewsletterPreferences {
  productUpdates: boolean;
  tips: boolean;
  industryNews: boolean;
  successStories: boolean;
}

export interface SubscribeParams {
  email: string;
  userId?: number;
  source: 'homepage' | 'dashboard' | 'footer' | 'other';
  userType?: 'visitor' | 'centre' | 'jury';
  preferences?: NewsletterPreferences;
}

export class NewsletterService {
  /**
   * Generate a secure subscription token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Subscribe a user to the newsletter
   * Returns the subscription record with token for confirmation email
   */
  static async subscribe(params: SubscribeParams) {
    const { email, userId, source, preferences } = params;
    
    // Determine userType based on userId
    // If userId is provided, userType will be fetched from the user record
    // If userId is null, userType is always 'visitor'
    let userType = params.userType || 'visitor';
    
    // Enforce constraint: if userId is null, userType must be 'visitor'
    if (!userId) {
      userType = 'visitor';
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'Email invalide.',
        subscription: null,
      };
    }

    // Check if email already exists
    const existing = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    if (existing.length > 0) {
      const subscription = existing[0];
      
      // If already active, return existing subscription
      if (subscription.status === 'active') {
        return {
          success: false,
          message: 'Cet email est déjà inscrit à la newsletter.',
          subscription: null,
        };
      }

      // If unsubscribed, allow re-subscription
      if (subscription.status === 'unsubscribed') {
        const newToken = this.generateToken();
        const updated = await db
          .update(newsletterSubscriptions)
          .set({
            status: 'pending',
            subscriptionToken: newToken,
            userId: userId || subscription.userId,
            source: source || subscription.source,
            userType: userType || subscription.userType,
            preferences: preferences || subscription.preferences,
            unsubscribedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscriptions.id, subscription.id))
          .returning();

        return {
          success: true,
          message: 'Réinscription en cours. Veuillez confirmer votre email.',
          subscription: updated[0],
        };
      }

      // If pending, resend confirmation
      return {
        success: true,
        message: 'Un email de confirmation a déjà été envoyé. Veuillez vérifier votre boîte de réception.',
        subscription: subscription,
      };
    }

    // Create new subscription
    const token = this.generateToken();
    const defaultPreferences: NewsletterPreferences = {
      productUpdates: true,
      tips: true,
      industryNews: true,
      successStories: true,
    };

    const newSubscription = await db
      .insert(newsletterSubscriptions)
      .values({
        email,
        userId: userId || null,
        status: 'pending',
        source,
        userType: userType || 'visitor',
        preferences: preferences || defaultPreferences,
        subscriptionToken: token,
      })
      .returning();

    return {
      success: true,
      message: 'Inscription réussie ! Veuillez confirmer votre email.',
      subscription: newSubscription[0],
    };
  }

  /**
   * Confirm a newsletter subscription using the token
   */
  static async confirm(token: string) {
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.subscriptionToken, token))
      .limit(1);

    if (subscription.length === 0) {
      return {
        success: false,
        message: 'Token de confirmation invalide.',
      };
    }

    const sub = subscription[0];

    if (sub.status === 'active') {
      return {
        success: false,
        message: 'Cet email est déjà confirmé.',
      };
    }

    const updated = await db
      .update(newsletterSubscriptions)
      .set({
        status: 'active',
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.id, sub.id))
      .returning();

    return {
      success: true,
      message: 'Votre inscription à la newsletter est confirmée !',
      subscription: updated[0],
    };
  }

  /**
   * Unsubscribe from newsletter using token
   */
  static async unsubscribe(token: string) {
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.subscriptionToken, token))
      .limit(1);

    if (subscription.length === 0) {
      return {
        success: false,
        message: 'Token de désinscription invalide.',
      };
    }

    const sub = subscription[0];

    if (sub.status === 'unsubscribed') {
      return {
        success: false,
        message: 'Vous êtes déjà désinscrit de la newsletter.',
      };
    }

    const updated = await db
      .update(newsletterSubscriptions)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.id, sub.id))
      .returning();

    return {
      success: true,
      message: 'Vous avez été désinscrit de la newsletter.',
      subscription: updated[0],
    };
  }

  /**
   * Update newsletter preferences for a user
   */
  static async updatePreferences(
    email: string,
    preferences: Partial<NewsletterPreferences>
  ) {
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(
        and(
          eq(newsletterSubscriptions.email, email),
          eq(newsletterSubscriptions.status, 'active')
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return {
        success: false,
        message: 'Aucune inscription active trouvée pour cet email.',
      };
    }

    const currentPrefs = subscription[0].preferences as NewsletterPreferences;
    const updatedPrefs = { ...currentPrefs, ...preferences };

    const updated = await db
      .update(newsletterSubscriptions)
      .set({
        preferences: updatedPrefs,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.id, subscription[0].id))
      .returning();

    return {
      success: true,
      message: 'Vos préférences ont été mises à jour.',
      subscription: updated[0],
    };
  }

  /**
   * Get subscription by email
   */
  static async getByEmail(email: string) {
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    return subscription.length > 0 ? subscription[0] : null;
  }

  /**
   * Get subscription by user ID
   */
  static async getByUserId(userId: number) {
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.userId, userId))
      .limit(1);

    return subscription.length > 0 ? subscription[0] : null;
  }

  /**
   * Get all active subscribers (for admin/newsletter sending)
   */
  static async getActiveSubscribers() {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.status, 'active'));
  }
}
