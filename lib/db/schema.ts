import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  userType: varchar('user_type', { length: 20 }).default('centre'),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  profileCompleted: boolean('profile_completed').default(false),
  validationStatus: varchar('validation_status', { length: 20 }).default('pending'),
  validationComment: text('validation_comment'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Epic 01 - SimplyJury Tables

export const trainingCenters = pgTable('training_centers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  siret: varchar('siret', { length: 14 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  region: varchar('region', { length: 50 }),
  sector: text('sector'),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  contactPersonName: varchar('contact_person_name', { length: 255 }),
  contactPersonRole: varchar('contact_person_role', { length: 100 }),
  contactPersonEmail: varchar('contact_person_email', { length: 255 }),
  contactPersonPhone: varchar('contact_person_phone', { length: 20 }),
  isCertificateur: boolean('is_certificateur').default(false),
  certificationDomains: text('certification_domains').array(),
  subscriptionTier: varchar('subscription_tier', { length: 20 }).default('gratuit'),
  qualiopiCertified: boolean('qualiopi_certified').default(false),
  qualiopiStatus: text('qualiopi_status'),
  qualiopiLastChecked: timestamp('qualiopi_last_checked'),
  franceCompetenceSyncEnabled: boolean('france_competence_sync_enabled').default(false),
  franceCompetenceLastSync: timestamp('france_competence_last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const juryProfiles = pgTable('jury_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profilePhotoUrl: text('profile_photo_url'),
  region: varchar('region', { length: 50 }).notNull(),
  city: varchar('city', { length: 100 }),
  expertiseDomains: text('expertise_domains').array().notNull(),
  certifications: text('certifications').array(),
  experienceYears: integer('experience_years'),
  currentPosition: varchar('current_position', { length: 200 }),
  availabilityPreferences: jsonb('availability_preferences'),
  workModalities: text('work_modalities').array(),
  interventionZones: text('intervention_zones').array(),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const certificationDomains = pgTable('certification_domains', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const frenchRegions = pgTable('french_regions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  active: boolean('active').default(true),
});

export const franceCompetenceCertifications = pgTable('france_competence_certifications', {
  id: serial('id').primaryKey(),
  trainingCenterId: integer('training_center_id')
    .references(() => trainingCenters.id, { onDelete: 'cascade' }),
  fcCertificationId: varchar('fc_certification_id', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  code: varchar('code', { length: 50 }),
  level: varchar('level', { length: 50 }),
  domain: varchar('domain', { length: 200 }),
  status: varchar('status', { length: 50 }),
  validityStart: timestamp('validity_start'),
  validityEnd: timestamp('validity_end'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const certificationStats = pgTable('certification_stats', {
  id: serial('id').primaryKey(),
  franceCompetenceCertificationId: integer('france_competence_certification_id')
    .references(() => franceCompetenceCertifications.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  candidatesCount: integer('candidates_count').default(0),
  successfulCandidates: integer('successful_candidates').default(0),
  totalSessions: integer('total_sessions').default(0),
  lastSessionDate: timestamp('last_session_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  maintenanceMessage: text('maintenance_message'),
  lastModifiedBy: integer('last_modified_by')
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  trainingCenter: one(trainingCenters),
  juryProfile: one(juryProfiles),
}));

export const trainingCentersRelations = relations(trainingCenters, ({ one, many }) => ({
  user: one(users, {
    fields: [trainingCenters.userId],
    references: [users.id],
  }),
  franceCompetenceCertifications: many(franceCompetenceCertifications),
}));

export const juryProfilesRelations = relations(juryProfiles, ({ one }) => ({
  user: one(users, {
    fields: [juryProfiles.userId],
    references: [users.id],
  }),
}));

export const franceCompetenceCertificationsRelations = relations(franceCompetenceCertifications, ({ one, many }) => ({
  trainingCenter: one(trainingCenters, {
    fields: [franceCompetenceCertifications.trainingCenterId],
    references: [trainingCenters.id],
  }),
  certificationStats: many(certificationStats),
}));

export const certificationStatsRelations = relations(certificationStats, ({ one }) => ({
  franceCompetenceCertification: one(franceCompetenceCertifications, {
    fields: [certificationStats.franceCompetenceCertificationId],
    references: [franceCompetenceCertifications.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Epic 01 - SimplyJury Types
export type TrainingCenter = typeof trainingCenters.$inferSelect;
export type NewTrainingCenter = typeof trainingCenters.$inferInsert;
export type JuryProfile = typeof juryProfiles.$inferSelect;
export type NewJuryProfile = typeof juryProfiles.$inferInsert;
export type CertificationDomain = typeof certificationDomains.$inferSelect;
export type NewCertificationDomain = typeof certificationDomains.$inferInsert;
export type FrenchRegion = typeof frenchRegions.$inferSelect;
export type NewFrenchRegion = typeof frenchRegions.$inferInsert;
export type FranceCompetenceCertification = typeof franceCompetenceCertifications.$inferSelect;
export type NewFranceCompetenceCertification = typeof franceCompetenceCertifications.$inferInsert;
export type CertificationStats = typeof certificationStats.$inferSelect;
export type NewCertificationStats = typeof certificationStats.$inferInsert;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;

// Complex types
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export type UserWithProfile = User & {
  trainingCenter?: TrainingCenter | null;
  juryProfile?: JuryProfile | null;
};

export type TrainingCenterWithUser = TrainingCenter & {
  user: User;
  franceCompetenceCertifications?: FranceCompetenceCertification[];
};

export type JuryProfileWithUser = JuryProfile & {
  user: User;
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
