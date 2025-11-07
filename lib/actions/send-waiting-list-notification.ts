'use server';

import { Resend } from 'resend';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { WaitingListNotification } from '@/components/emails/waiting-list-notification';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `${process.env.FROM_NAME || 'SimplyJury'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;

interface SendWaitingListNotificationParams {
  email: string;
  centerName?: string;
  desiredTier: 'basic' | 'pro';
  triggeredBy: 'limit_reached' | 'pricing_page' | 'dashboard_cta' | 'manual';
  currentContactsUsed?: number;
}

export async function sendWaitingListNotification(
  params: SendWaitingListNotificationParams
) {
  try {
    // Get all admin users
    const adminUsers = await db
      .select({
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.userType, 'admin'));

    if (adminUsers.length === 0) {
      console.warn('No admin users found to send waiting list notification');
      return { success: false, error: 'No admin users found' };
    }

    // Dashboard URL pointing to waiting list page
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/waiting-list`;

    // Determine subject based on context
    const getSubject = () => {
      const tierLabel = params.desiredTier === 'basic' ? 'Basic' : 'Pro';
      
      if (params.triggeredBy === 'limit_reached') {
        return `🚨 Urgent - Utilisateur bloqué intéressé par ${tierLabel}`;
      }
      return `🎯 Nouvelle inscription liste d'attente - ${tierLabel}`;
    };

    // Send email to all admin users
    const emailPromises = adminUsers.map(async (admin) => {
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: admin.email,
          subject: getSubject(),
          react: WaitingListNotification({
            email: params.email,
            centerName: params.centerName,
            desiredTier: params.desiredTier,
            triggeredBy: params.triggeredBy,
            currentContactsUsed: params.currentContactsUsed,
            dashboardUrl,
          }),
        });

        if (error) {
          console.error(`Failed to send waiting list notification to ${admin.email}:`, error);
          return { success: false, email: admin.email, error };
        }

        console.log(`Waiting list notification sent to ${admin.email}`);
        return { success: true, email: admin.email, data };
      } catch (error) {
        console.error(`Error sending waiting list notification to ${admin.email}:`, error);
        return { success: false, email: admin.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(
      `Waiting list notifications sent: ${successCount}/${adminUsers.length}`
    );

    return {
      success: successCount > 0,
      totalAdmins: adminUsers.length,
      successCount,
      results,
    };
  } catch (error) {
    console.error('Error in sendWaitingListNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
