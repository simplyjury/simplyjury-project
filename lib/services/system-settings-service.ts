import { db } from '@/lib/db/drizzle';
import { systemSettings, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { SystemSettings, NewSystemSettings } from '@/lib/db/schema';

export class SystemSettingsService {
  static async getMaintenanceMode(): Promise<boolean> {
    try {
      const result = await db
        .select({ maintenanceMode: systemSettings.maintenanceMode })
        .from(systemSettings)
        .orderBy(desc(systemSettings.id))
        .limit(1);

      return result[0]?.maintenanceMode ?? false;
    } catch (error) {
      console.error('Error getting maintenance mode:', error);
      return false;
    }
  }

  static async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const result = await db
        .select()
        .from(systemSettings)
        .orderBy(desc(systemSettings.id))
        .limit(1);

      return result[0] ?? null;
    } catch (error) {
      console.error('Error getting system settings:', error);
      return null;
    }
  }

  static async updateMaintenanceMode(
    enabled: boolean,
    message: string | null,
    adminUserId: number
  ): Promise<SystemSettings> {
    try {
      // Check if admin user exists and has admin user_type
      const adminUser = await db
        .select({ userType: users.userType })
        .from(users)
        .where(eq(users.id, adminUserId))
        .limit(1);

      if (!adminUser[0] || adminUser[0].userType !== 'admin') {
        throw new Error('Unauthorized: Only admin users can modify maintenance mode');
      }

      // Get current settings or create new ones
      const currentSettings = await this.getSystemSettings();

      if (currentSettings) {
        // Update existing settings
        const updated = await db
          .update(systemSettings)
          .set({
            maintenanceMode: enabled,
            maintenanceMessage: message,
            lastModifiedBy: adminUserId,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.id, currentSettings.id))
          .returning();

        return updated[0];
      } else {
        // Create new settings
        const created = await db
          .insert(systemSettings)
          .values({
            maintenanceMode: enabled,
            maintenanceMessage: message,
            lastModifiedBy: adminUserId,
          })
          .returning();

        return created[0];
      }
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      throw error;
    }
  }

  static async isUserAdmin(userId: number): Promise<boolean> {
    try {
      const user = await db
        .select({ userType: users.userType })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user[0]?.userType === 'admin';
    } catch (error) {
      console.error('Error checking user admin status:', error);
      return false;
    }
  }
}
