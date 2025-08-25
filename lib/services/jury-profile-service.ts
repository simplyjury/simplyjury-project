import { db } from '@/lib/db/drizzle';
import { juryProfiles, users } from '@/lib/db/schema';
import { eq, and, arrayContains } from 'drizzle-orm';
import type { NewJuryProfile, JuryProfileWithUser } from '@/lib/db/schema';

export class JuryProfileService {
  static async createProfile(userId: number, data: Omit<NewJuryProfile, 'userId'>): Promise<number> {
    const [juryProfile] = await db
      .insert(juryProfiles)
      .values({
        ...data,
        userId,
      })
      .returning({ id: juryProfiles.id });

    return juryProfile.id;
  }

  static async getByUserId(userId: number) {
    const [juryProfile] = await db
      .select()
      .from(juryProfiles)
      .where(eq(juryProfiles.userId, userId))
      .limit(1);

    return juryProfile;
  }

  static async updateProfile(userId: number, data: Partial<Omit<NewJuryProfile, 'userId'>>) {
    const [updated] = await db
      .update(juryProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(juryProfiles.userId, userId))
      .returning();

    return updated;
  }

  static async getWithUser(juryProfileId: number): Promise<JuryProfileWithUser | null> {
    const result = await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(eq(juryProfiles.id, juryProfileId))
      .limit(1);

    if (!result.length) return null;

    return {
      ...result[0].jury_profiles,
      user: result[0].users,
    };
  }

  static async getAllValidated() {
    return await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(eq(users.validationStatus, 'validated'));
  }

  static async searchByRegion(region: string) {
    return await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(and(
        eq(juryProfiles.region, region),
        eq(users.validationStatus, 'validated')
      ));
  }

  static async searchByExpertise(domain: string) {
    return await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(and(
        arrayContains(juryProfiles.expertiseDomains, [domain]),
        eq(users.validationStatus, 'validated')
      ));
  }

  static async searchByWorkModality(modality: 'visio' | 'presentiel') {
    return await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(and(
        arrayContains(juryProfiles.workModalities, [modality]),
        eq(users.validationStatus, 'validated')
      ));
  }

  static async getByExperienceRange(minYears: number, maxYears?: number) {
    let query = db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(and(
        eq(users.validationStatus, 'validated')
      ));

    // Add experience filter logic here based on requirements
    return await query;
  }

  static async searchAdvanced(filters: {
    region?: string;
    expertiseDomains?: string[];
    workModalities?: ('visio' | 'presentiel')[];
    minExperience?: number;
    maxHourlyRate?: number;
  }) {
    let conditions = [eq(users.validationStatus, 'validated')];

    if (filters.region) {
      conditions.push(eq(juryProfiles.region, filters.region));
    }

    // Add more filter conditions as needed
    
    return await db
      .select()
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(and(...conditions));
  }
}
