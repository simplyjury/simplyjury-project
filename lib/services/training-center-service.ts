import { db } from '@/lib/db/drizzle';
import { trainingCenters, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { NewTrainingCenter, TrainingCenterWithUser } from '@/lib/db/schema';

export class TrainingCenterService {
  static async createProfile(userId: number, data: Omit<NewTrainingCenter, 'userId'>): Promise<number> {
    const [trainingCenter] = await db
      .insert(trainingCenters)
      .values({
        ...data,
        userId,
      })
      .returning({ id: trainingCenters.id });

    return trainingCenter.id;
  }

  static async getByUserId(userId: number) {
    const [trainingCenter] = await db
      .select()
      .from(trainingCenters)
      .where(eq(trainingCenters.userId, userId))
      .limit(1);

    return trainingCenter;
  }

  static async updateProfile(userId: number, data: Partial<Omit<NewTrainingCenter, 'userId'>>) {
    const [updated] = await db
      .update(trainingCenters)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(trainingCenters.userId, userId))
      .returning();

    return updated;
  }

  static async getWithUser(trainingCenterId: number): Promise<TrainingCenterWithUser | null> {
    const result = await db
      .select()
      .from(trainingCenters)
      .innerJoin(users, eq(trainingCenters.userId, users.id))
      .where(eq(trainingCenters.id, trainingCenterId))
      .limit(1);

    if (!result.length) return null;

    return {
      ...result[0].training_centers,
      user: result[0].users,
    };
  }

  static async validateSiret(siret: string, excludeUserId?: number): Promise<boolean> {
    if (excludeUserId) {
      const existing = await db
        .select({ id: trainingCenters.id })
        .from(trainingCenters)
        .where(and(
          eq(trainingCenters.siret, siret),
          eq(trainingCenters.userId, excludeUserId)
        ))
        .limit(1);
      return existing.length === 0;
    }

    const existing = await db
      .select({ id: trainingCenters.id })
      .from(trainingCenters)
      .where(eq(trainingCenters.siret, siret))
      .limit(1);

    return existing.length === 0;
  }

  static async getAllValidated() {
    return await db
      .select()
      .from(trainingCenters)
      .innerJoin(users, eq(trainingCenters.userId, users.id))
      .where(eq(users.validationStatus, 'validated'));
  }

  static async searchByRegion(region: string) {
    return await db
      .select()
      .from(trainingCenters)
      .innerJoin(users, eq(trainingCenters.userId, users.id))
      .where(and(
        eq(trainingCenters.region, region),
        eq(users.validationStatus, 'validated')
      ));
  }

  static async getCertificateurs() {
    return await db
      .select()
      .from(trainingCenters)
      .innerJoin(users, eq(trainingCenters.userId, users.id))
      .where(and(
        eq(trainingCenters.isCertificateur, true),
        eq(users.validationStatus, 'validated')
      ));
  }
}
