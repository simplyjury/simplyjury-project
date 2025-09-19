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
    const result = await db
      .select({
        // Jury profile fields
        id: juryProfiles.id,
        userId: juryProfiles.userId,
        firstName: juryProfiles.firstName,
        lastName: juryProfiles.lastName,
        profilePhotoUrl: juryProfiles.profilePhotoUrl,
        region: juryProfiles.region,
        city: juryProfiles.city,
        phone: juryProfiles.phone,
        expertiseDomains: juryProfiles.expertiseDomains,
        certifications: juryProfiles.certifications,
        experienceYears: juryProfiles.experienceYears,
        currentPosition: juryProfiles.currentPosition,
        currentCompany: juryProfiles.currentCompany,
        availabilityPreferences: juryProfiles.availabilityPreferences,
        workModalities: juryProfiles.workModalities,
        interventionZones: juryProfiles.interventionZones,
        hourlyRate: juryProfiles.hourlyRate,
        bio: juryProfiles.bio,
        createdAt: juryProfiles.createdAt,
        updatedAt: juryProfiles.updatedAt,
        // User fields
        displayName: users.name,
      })
      .from(juryProfiles)
      .innerJoin(users, eq(juryProfiles.userId, users.id))
      .where(eq(juryProfiles.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  static async updateProfile(userId: number, data: Partial<Omit<NewJuryProfile, 'userId'>> & { displayName?: string }) {
    // Clean up numeric fields - convert empty strings to null
    const cleanedData = { ...data };
    
    if ('hourlyRate' in cleanedData) {
      if (cleanedData.hourlyRate === null || cleanedData.hourlyRate === undefined) {
        cleanedData.hourlyRate = null;
      } else if (typeof cleanedData.hourlyRate === 'string') {
        if (cleanedData.hourlyRate === '') {
          cleanedData.hourlyRate = null;
        }
        // If it's a valid string number, leave it as is since decimal fields can accept string numbers
      }
    }
    
    if ('experienceYears' in cleanedData) {
      if (cleanedData.experienceYears === null || cleanedData.experienceYears === undefined) {
        cleanedData.experienceYears = null;
      } else if (typeof cleanedData.experienceYears === 'string') {
        if (cleanedData.experienceYears === '') {
          cleanedData.experienceYears = null;
        } else {
          const parsed = parseInt(cleanedData.experienceYears);
          cleanedData.experienceYears = isNaN(parsed) ? null : parsed;
        }
      }
    }

    // Handle currentCompany field - ensure empty strings are handled properly
    if ('currentCompany' in cleanedData) {
      if (cleanedData.currentCompany === '') {
        cleanedData.currentCompany = null;
      }
    }

    // Handle display name separately - update users table
    if ('displayName' in cleanedData) {
      await db
        .update(users)
        .set({ name: cleanedData.displayName })
        .where(eq(users.id, userId));
      
      // Remove displayName from cleanedData since it's not part of jury_profiles table
      delete cleanedData.displayName;
    }

    const [updated] = await db
      .update(juryProfiles)
      .set({
        ...cleanedData,
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
