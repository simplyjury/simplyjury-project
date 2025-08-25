# Spécifications Techniques - EPIC 01 : Gestion des Utilisateurs & Authentification

## Vue d'ensemble

**Epic :** EPIC 01 - Gestion des Utilisateurs & Authentification  
**Objectif :** Implémenter le système d'authentification complet pour les centres de formation et jurys professionnels  
**Technologies :** Next.js 14, Supabase, Drizzle ORM, TypeScript, Tailwind CSS  

---

## Architecture Technique
- **ORM :** Drizzle ORM
- **Authentification :** JWT + bcrypt (déjà implémenté)
- **Styling :** Tailwind CSS + shadcn/ui
- **Validation :** Zod
- **Emails transactionnels :** Resend
- **APIs externes :** API INSEE SIRET, API France Compétence

### Système d'Authentification Existant

Le boilerplate inclut déjà un système d'authentification complet :

- **Inscription/Connexion** : Pages `/sign-up` et `/sign-in` fonctionnelles
- **Hachage des mots de passe** : bcrypt avec 10 rounds de salt
- **Sessions JWT** : Tokens sécurisés avec expiration 24h
- **Cookies sécurisés** : HttpOnly, Secure, SameSite
- **Validation Zod** : Email et mot de passe (min 8 caractères)
- **Gestion d'équipes** : Système multi-tenant avec invitations
- **Logs d'activité** : Traçabilité des actions utilisateurs

### Avantages du Système Existant

- **Gain de temps** : 60% du travail d'authentification déjà fait
- **Sécurité éprouvée** : bcrypt + JWT + cookies sécurisés
- **Architecture moderne** : Server Actions + Drizzle ORM
- **Gestion d'équipes** : Système multi-tenant déjà opérationnel
- **Validation robuste** : Zod + middleware de sécurité
- **Emails professionnels** : Intégration Resend pour une communication de qualité

---

## Modèle de Données

### 1. Extension du schéma utilisateur existant **[Complexité: 3/10]**

**Table `users` actuelle :**
```typescript
// lib/db/schema.ts - Table existante
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  user_type: varchar('user_type', { length: 20 }).default('centre'), // 'centre', 'jury', 'admin'
  email_verified: boolean('email_verified').default(false),
  email_verification_token: text('email_verification_token'),
  password_reset_token: text('password_reset_token'),
  password_reset_expires: timestamp('password_reset_expires'),
  profile_completed: boolean('profile_completed').default(false),
  validation_status: varchar('validation_status', { length: 20 }).default('pending'),
  validation_comment: text('validation_comment'),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
});
```


### 2. Table des profils centres de formation **[Complexité: 4/10]**

```sql
CREATE TABLE training_centers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    siret VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    region VARCHAR(50),
    contact_person_name VARCHAR(255),
    contact_person_role VARCHAR(100),
    is_certificateur BOOLEAN DEFAULT false,
    certification_domains TEXT[], -- Array de domaines de certification
    france_competence_sync_enabled BOOLEAN DEFAULT false,
    france_competence_last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Table des profils jurys **[Complexité: 4/10]**

```sql
CREATE TABLE jury_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_photo_url TEXT,
    region VARCHAR(50) NOT NULL,
    expertise_domains TEXT[] NOT NULL, -- Array de domaines d'expertise
    certifications TEXT[], -- Array des certifications détenues
    experience_years INTEGER,
    current_position VARCHAR(200),
    availability_preferences JSONB, -- Stockage flexible des disponibilités
    work_modalities TEXT[] CHECK (work_modalities <@ ARRAY['visio', 'presentiel']),
    intervention_zones TEXT[], -- Zones géographiques d'intervention
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Tables de référence **[Complexité: 2/10]**

```sql
-- Domaines de certification
CREATE TABLE certification_domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Régions françaises
CREATE TABLE french_regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true
);

-- Insertion des 13 régions administratives françaises
INSERT INTO french_regions (name, code) VALUES
('Auvergne-Rhône-Alpes', 'ARA'),
('Bourgogne-Franche-Comté', 'BFC'),
('Bretagne', 'BRE'),
('Centre-Val de Loire', 'CVL'),
('Corse', 'COR'),
('Grand Est', 'GES'),
('Hauts-de-France', 'HDF'),
('Île-de-France', 'IDF'),
('Normandie', 'NOR'),
('Nouvelle-Aquitaine', 'NAQ'),
('Occitanie', 'OCC'),
('Pays de la Loire', 'PDL'),
('Provence-Alpes-Côte d\'Azur', 'PAC');

-- Certifications France Compétence
CREATE TABLE france_competence_certifications (
    id SERIAL PRIMARY KEY,
    training_center_id INTEGER REFERENCES training_centers(id) ON DELETE CASCADE,
    fc_certification_id VARCHAR(50) NOT NULL, -- ID France Compétence
    title VARCHAR(500) NOT NULL,
    code VARCHAR(50),
    level VARCHAR(50),
    domain VARCHAR(200),
    status VARCHAR(50),
    validity_start DATE,
    validity_end DATE,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **CRITIQUE : Sécurité RLS (Row Level Security)** **[Complexité: 8/10]**

Le système actuel **ne possède aucune politique RLS**, ce qui représente une **vulnérabilité de sécurité majeure**. L'implémentation des politiques RLS est **obligatoire** avant toute mise en production.

#### **1. Politiques pour la table `users`**

```sql
-- Activation RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "users_select_own" ON users 
FOR SELECT USING (id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY "users_update_own" ON users 
FOR UPDATE USING (id = current_setting('app.current_user_id', true)::integer);

-- Les admins peuvent tout voir/modifier
CREATE POLICY "users_admin_all" ON users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin'
  )
);
```

#### **2. Politiques pour `training_centers`**

```sql
ALTER TABLE training_centers ENABLE ROW LEVEL SECURITY;

-- Les centres ne peuvent accéder qu'à leur propre profil
CREATE POLICY "training_centers_own" ON training_centers 
FOR ALL USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Les jurys peuvent consulter les centres (pour recherche/contact)
CREATE POLICY "training_centers_jury_view" ON training_centers 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'jury'
  )
);

-- Les admins peuvent tout voir
CREATE POLICY "training_centers_admin_all" ON training_centers 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin'
  )
);
```

#### **3. Politiques pour `jury_profiles`**

```sql
ALTER TABLE jury_profiles ENABLE ROW LEVEL SECURITY;

-- Les jurys ne peuvent accéder qu'à leur propre profil
CREATE POLICY "jury_profiles_own" ON jury_profiles 
FOR ALL USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Les centres peuvent voir les profils jurys validés (pour recherche)
CREATE POLICY "jury_profiles_center_view" ON jury_profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN jury_profiles jp ON jp.user_id = u.id
    WHERE u.id = current_setting('app.current_user_id', true)::integer 
    AND u.user_type = 'centre'
    AND jp.validation_status = 'validated'
  )
);

-- Les admins peuvent tout voir
CREATE POLICY "jury_profiles_admin_all" ON jury_profiles 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin'
  )
);
```

#### **4. Politiques pour tables de référence**

```sql
-- Tables de référence : lecture seule pour tous les utilisateurs authentifiés
ALTER TABLE certification_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certification_domains_read_all" ON certification_domains 
FOR SELECT USING (current_setting('app.current_user_id', true) IS NOT NULL);

ALTER TABLE french_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "french_regions_read_all" ON french_regions 
FOR SELECT USING (current_setting('app.current_user_id', true) IS NOT NULL);

-- France Compétence : seuls les centres certificateurs peuvent voir leurs certifications
ALTER TABLE france_competence_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fc_certifications_own_center" ON france_competence_certifications 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM training_centers tc
    WHERE tc.id = training_center_id 
    AND tc.user_id = current_setting('app.current_user_id', true)::integer
    AND tc.is_certificateur = true
  )
);
```

#### **5. Migration RLS - Script d'implémentation**

**Fichier :** `lib/db/migrations/001_enable_rls.sql`

```sql
-- Migration pour activer RLS sur toutes les tables
-- ATTENTION : À exécuter APRÈS la création des tables

BEGIN;

-- Extension de la table users existante (ALTER TABLE)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'centre';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS validation_comment TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Contraintes CHECK pour validation
ALTER TABLE users ADD CONSTRAINT check_user_type CHECK (user_type IN ('centre', 'jury', 'admin'));
ALTER TABLE users ADD CONSTRAINT check_validation_status CHECK (validation_status IN ('pending', 'validated', 'rejected'));

-- Activation RLS sur toutes les tables utilisateurs
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE french_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE france_competence_certifications ENABLE ROW LEVEL SECURITY;

-- Politiques users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = current_setting('app.current_user_id', true)::integer);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = current_setting('app.current_user_id', true)::integer);
CREATE POLICY "users_admin_all" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin')
);

-- Politiques training_centers
CREATE POLICY "training_centers_own" ON training_centers FOR ALL USING (user_id = current_setting('app.current_user_id', true)::integer);
CREATE POLICY "training_centers_jury_view" ON training_centers FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'jury')
);
CREATE POLICY "training_centers_admin_all" ON training_centers FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin')
);

-- Politiques jury_profiles
CREATE POLICY "jury_profiles_own" ON jury_profiles FOR ALL USING (user_id = current_setting('app.current_user_id', true)::integer);
CREATE POLICY "jury_profiles_center_view" ON jury_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = current_setting('app.current_user_id', true)::integer AND u.user_type = 'centre'
  ) AND validation_status = 'validated'
);
CREATE POLICY "jury_profiles_admin_all" ON jury_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', true)::integer AND user_type = 'admin')
);

-- Politiques tables de référence
CREATE POLICY "certification_domains_read_all" ON certification_domains FOR SELECT USING (current_setting('app.current_user_id', true) IS NOT NULL);
CREATE POLICY "french_regions_read_all" ON french_regions FOR SELECT USING (current_setting('app.current_user_id', true) IS NOT NULL);
CREATE POLICY "fc_certifications_own_center" ON france_competence_certifications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM training_centers tc
    WHERE tc.id = training_center_id AND tc.user_id = current_setting('app.current_user_id', true)::integer AND tc.is_certificateur = true
  )
);

COMMIT;
```

#### **6. Authentification Context pour RLS**

**Fichier :** `lib/auth/rls-context.ts`

```typescript
// Service pour définir le contexte utilisateur pour RLS
export async function setRLSContext(userId: number): Promise<void> {
  // Cette fonction doit être appelée après l'authentification JWT
  // pour définir le contexte utilisateur pour les politiques RLS
  
  // Définir l'utilisateur actuel pour les politiques RLS
  await db.execute(sql`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`);
}

// Utilisation dans le middleware d'authentification
export async function withRLSContext<T>(userId: number, callback: () => Promise<T>): Promise<T> {
  await setRLSContext(userId);
  try {
    return await callback();
  } finally {
    // Nettoyer le contexte après utilisation
    await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
  }
}

// Helper pour obtenir l'ID utilisateur actuel depuis le contexte RLS
export async function getCurrentUserId(): Promise<number | null> {
  const result = await db.execute(sql`SELECT current_setting('app.current_user_id', true) as user_id`);
  const userId = result[0]?.user_id;
  return userId && userId !== '' ? parseInt(userId) : null;
}
```

---

## Implémentation Technique

### 1. Configuration Drizzle ORM **[Complexité: 3/10]**

**En résumé :** Cette étape consiste à "enseigner" à l'application la structure des nouvelles tables que nous avons créées en base de données. Drizzle ORM est l'outil qui permet à notre code JavaScript/TypeScript de communiquer avec la base de données PostgreSQL. Actuellement, il ne connaît que les anciennes tables (users, teams, etc.) mais pas les nouvelles tables spécialisées pour SimplyJury (centres de formation, jurys, certifications). Cette configuration est essentielle car elle définit les types de données, les relations entre tables, et garantit la sécurité du code en évitant les erreurs de programmation.

**Fichier :** `lib/db/schema.ts`

```typescript
import { pgTable, serial, varchar, text, boolean, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Extension de la table users existante
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('member'),
  user_type: varchar('user_type', { length: 20 }).default('centre'), // 'centre', 'jury', 'admin'
  email_verified: boolean('email_verified').default(false),
  email_verification_token: text('email_verification_token'),
  password_reset_token: text('password_reset_token'),
  password_reset_expires: timestamp('password_reset_expires'),
  profile_completed: boolean('profile_completed').default(false),
  validation_status: varchar('validation_status', { length: 20 }).default('pending'),
  validation_comment: text('validation_comment'),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
});

export const trainingCenters = pgTable('training_centers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  siret: varchar('siret', { length: 14 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  region: varchar('region', { length: 50 }),
  contactPersonName: varchar('contact_person_name', { length: 255 }),
  contactPersonRole: varchar('contact_person_role', { length: 100 }),
  isCertificateur: boolean('is_certificateur').default(false),
  certificationDomains: text('certification_domains').array(),
  franceCompetenceSyncEnabled: boolean('france_competence_sync_enabled').default(false),
  franceCompetenceLastSync: timestamp('france_competence_last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const juryProfiles = pgTable('jury_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profilePhotoUrl: text('profile_photo_url'),
  region: varchar('region', { length: 50 }).notNull(),
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
```

### 2. Services d'authentification **[Complexité: 4/10]**

**En résumé :** Le système d'authentification actuel du boilerplate est générique et basique (inscription, connexion, sessions). Pour SimplyJury, nous devons l'étendre avec des fonctionnalités spécialisées : distinction entre types d'utilisateurs (centres/jurys/admins), vérification email obligatoire, validation des profils par les administrateurs, réinitialisation sécurisée de mot de passe, et emails automatiques. Ces extensions sont cruciales car SimplyJury ne peut pas fonctionner avec un système d'authentification standard - nous avons besoin de workflows spécifiques pour gérer la mise en relation sécurisée entre centres de formation et jurys professionnels, avec validation des identités et des compétences.

**Fichier :** `lib/auth/auth-service.ts`

```typescript
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = '7d';

  static async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  static generateJWT(userId: number, email: string, userType: string): string {
    return sign(
      { userId, email, userType },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static verifyJWT(token: string): any {
    return verify(token, this.JWT_SECRET);
  }

  static generateEmailVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async createUser(data: {
    email: string;
    password: string;
    name?: string;
    userType: 'centre' | 'jury';
  }) {
    const hashedPassword = await this.hashPassword(data.password);
    const verificationToken = this.generateEmailVerificationToken();

    const [user] = await db.insert(users).values({
      email: data.email,
      password_hash: hashedPassword,
      name: data.name,
      user_type: data.userType,
      email_verification_token: verificationToken,
    }).returning();

    return { user, verificationToken };
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({
        email_verified: true,
        email_verification_token: null,
        updated_at: new Date(),
      })
      .where(eq(users.email_verification_token, token))
      .returning();

    return !!user;
  }
}

### 3. Service de réinitialisation mot de passe **[Complexité: 6/10]**

```typescript
// lib/auth/password-reset.ts
import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';
import { EmailService } from '@/lib/email/resend-service';

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
    
  if (user.length === 0) return false;
  
  const token = generateResetToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  
  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetExpires: expires,
    })
    .where(eq(users.id, user[0].id));
    
  await EmailService.sendPasswordResetEmail(email, user[0].name || 'Utilisateur', token);
  return true;
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const user = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetExpires, new Date())
      )
    )
    .limit(1);

  if (user.length === 0) return false;

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    })
    .where(eq(users.id, user[0].id));

  return true;
}
```

### 4. API Routes **[Complexité: 5/10]**

**Fichier :** `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  name: z.string().optional(),
  userType: z.enum(['centre', 'jury'], { required_error: 'Type d\'utilisateur requis' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { user, verificationToken } = await AuthService.createUser(validatedData);

    // Envoyer email de bienvenue et vérification
    await Promise.all([
      EmailService.sendWelcomeEmail(user.email, user.name, validatedData.userType),
      EmailService.sendVerificationEmail(user.email, user.name, verificationToken)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      userId: user.id,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la création du compte',
    }, { status: 500 });
  }
}

### 5. Service d'emails avec Resend **[Complexité: 6/10]**

```typescript
// lib/email/resend-service.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { VerificationEmail } from '@/components/emails/verification-email';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import { ProfileValidationEmail } from '@/components/emails/profile-validation-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static FROM_EMAIL = 'SimplyJury <noreply@simplyjury.com>';
  
  static async sendWelcomeEmail(email: string, name: string, userType: 'centre' | 'jury') {
    return await resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: 'Bienvenue sur SimplyJury !',
      react: WelcomeEmail({ name, userType }),
    });
  }
  
  static async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    return await resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: 'Vérifiez votre adresse email - SimplyJury',
      react: VerificationEmail({ name, verificationUrl }),
    });
  }
  
  static async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    return await resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - SimplyJury',
      react: PasswordResetEmail({ name, resetUrl }),
    });
  }
  
  static async sendProfileValidationEmail(
    email: string, 
    name: string, 
    status: 'approved' | 'rejected',
    comment?: string
  ) {
    const subject = status === 'approved' 
      ? 'Votre profil a été validé ! - SimplyJury'
      : 'Votre profil nécessite des modifications - SimplyJury';
      
    return await resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject,
      react: ProfileValidationEmail({ name, status, comment }),
    });
  }
}

### 6. Service de vérification email **[Complexité: 5/10]**

```typescript
// lib/auth/email-verification.ts
import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '@/lib/email/resend-service';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, name: string): Promise<void> {
  const token = generateVerificationToken();
  
  // Sauvegarder le token en base
  await db
    .update(users)
    .set({ emailVerificationToken: token })
    .where(eq(users.email, email));
    
  // Envoyer l'email via Resend
  await EmailService.sendVerificationEmail(email, name, token);
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  if (user.length === 0) return false;

  await db
    .update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
    })
    .where(eq(users.id, user[0].id));

  return true;
}
```


---

## Points de Test

### Tests d'authentification
1. **Inscription utilisateur**
   - Validation des champs obligatoires
   - Vérification de la complexité du mot de passe
   - Unicité de l'email
   - Envoi de l'email de vérification

2. **Connexion utilisateur**
   - Authentification avec email/mot de passe
   - Vérification du statut email validé
   - Génération et stockage du JWT
   - Redirection selon le type d'utilisateur

3. **Réinitialisation mot de passe**
   - Génération du token de réinitialisation
   - Envoi de l'email de réinitialisation
   - Validation du token et mise à jour du mot de passe

### Tests de sécurité RLS
1. **Isolation des données utilisateurs**
   - Vérifier qu'un centre ne peut pas voir les données d'un autre centre
   - Vérifier qu'un jury ne peut pas modifier le profil d'un autre jury
   - Tester l'accès admin sur toutes les tables

2. **Politiques de visibilité**
   - Centres peuvent voir uniquement les jurys validés
   - Jurys peuvent voir les centres pour recherche
   - Tables de référence accessibles à tous les utilisateurs authentifiés

### Tests des profils
1. **Profil centre de formation**
   - Validation SIRET via API INSEE
   - Auto-complétion des données entreprise
   - Gestion du statut certificateur
   - Synchronisation France Compétence

2. **Profil jury professionnel**
   - Validation des champs obligatoires
   - Upload et redimensionnement de photo
   - Gestion des disponibilités
   - Statut de validation admin

---

## Sécurité

### Mesures de sécurité implémentées
- **Hachage des mots de passe** avec bcrypt (salt rounds: 12)
- **JWT sécurisés** avec expiration et rotation
- **Cookies HttpOnly** pour le stockage des tokens
- **Validation des entrées** avec Zod
- **Protection CSRF** via SameSite cookies
- **Rate limiting** sur les endpoints sensibles
- **Logs d'activité** pour audit de sécurité

### Variables d'environnement requises

```env
# Base de données (déjà configuré)
DATABASE_URL=postgresql://user:password@localhost:5432/simplyjury

# Authentification (déjà configuré)
AUTH_SECRET=your-super-secret-jwt-key-here

# Application URL (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (emails transactionnels)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# APIs externes (à ajouter pour Epic 01)
INSEE_API_TOKEN=your-insee-api-token
FRANCE_COMPETENCE_API_TOKEN=your-france-competence-api-token

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Étapes d'implémentation

### Phase 1 : Extension de l'authentification existante (40% restant) **[Complexité Moyenne: 4/10]**
1. ✅ **Base auth** : Déjà implémentée (signup/signin/JWT/bcrypt)
2. 🔧 **Emails Resend** : Intégrer les templates et services email **[Complexité: 6/10]**
3. 🔧 **Vérification email** : Ajouter les tokens et pages de vérification **[Complexité: 5/10]**
4. 🔧 **Reset password** : Compléter le flow de réinitialisation **[Complexité: 6/10]**
5. 🔧 **Schema extension** : Ajouter les champs user_type, email_verified, etc. **[Complexité: 3/10]**

### Phase 2 : Profils utilisateurs spécialisés **[Complexité Moyenne: 7/10]**
1. Créer les formulaires de profil centre et jury **[Complexité: 8/10]**
2. Intégrer les APIs SIRET et France Compétence **[Complexité: 6/10]**
3. Implémenter la validation des profils **[Complexité: 5/10]**
4. Développer les tableaux de bord utilisateurs **[Complexité: 7/10]**

### Phase 3 : Validation admin et notifications **[Complexité Moyenne: 6/10]**
1. Système de validation admin des profils **[Complexité: 8/10]**
2. Notifications email pour les changements de statut **[Complexité: 4/10]**
3. Dashboard admin pour la gestion des utilisateurs **[Complexité: 7/10]**
4. Logs et audit trail **[Complexité: 5/10]**

### Phase 4 : Tests et optimisation **[Complexité Moyenne: 4/10]**
1. Tests unitaires et d'intégration **[Complexité: 3/10]**
2. Tests de sécurité et performance **[Complexité: 4/10]**
3. Optimisation UX et accessibilité **[Complexité: 5/10]**
4. Documentation utilisateur **[Complexité: 2/10]**
