import { db } from '@/lib/db/drizzle';
import { frenchRegions, certificationDomains } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { NewCertificationDomain } from '@/lib/db/schema';

export class ReferenceDataService {
  // French Regions
  static async getAllRegions() {
    return await db
      .select()
      .from(frenchRegions)
      .where(eq(frenchRegions.active, true))
      .orderBy(frenchRegions.name);
  }

  static async getRegionByCode(code: string) {
    const [region] = await db
      .select()
      .from(frenchRegions)
      .where(eq(frenchRegions.code, code))
      .limit(1);

    return region;
  }

  // Certification Domains
  static async getAllCertificationDomains() {
    return await db
      .select()
      .from(certificationDomains)
      .where(eq(certificationDomains.active, true))
      .orderBy(certificationDomains.name);
  }

  static async getCertificationDomainsByCategory(category: string) {
    return await db
      .select()
      .from(certificationDomains)
      .where(eq(certificationDomains.category, category))
      .orderBy(certificationDomains.name);
  }

  static async createCertificationDomain(data: NewCertificationDomain) {
    const [domain] = await db
      .insert(certificationDomains)
      .values(data)
      .returning();

    return domain;
  }

  static async updateCertificationDomain(id: number, data: Partial<NewCertificationDomain>) {
    const [updated] = await db
      .update(certificationDomains)
      .set(data)
      .where(eq(certificationDomains.id, id))
      .returning();

    return updated;
  }

  static async deactivateCertificationDomain(id: number) {
    const [deactivated] = await db
      .update(certificationDomains)
      .set({ active: false })
      .where(eq(certificationDomains.id, id))
      .returning();

    return deactivated;
  }

  // Utility functions for form options
  static async getRegionOptions() {
    const regions = await this.getAllRegions();
    return regions.map(region => ({
      value: region.code,
      label: region.name,
    }));
  }

  static async getCertificationDomainOptions() {
    const domains = await this.getAllCertificationDomains();
    return domains.map(domain => ({
      value: domain.name,
      label: domain.name,
      category: domain.category,
    }));
  }
}
