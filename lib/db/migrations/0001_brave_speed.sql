CREATE TABLE "certification_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(100),
	"description" text,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "certification_domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "certification_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"france_competence_certification_id" integer,
	"year" integer NOT NULL,
	"candidates_count" integer DEFAULT 0,
	"successful_candidates" integer DEFAULT 0,
	"total_sessions" integer DEFAULT 0,
	"last_session_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "france_competence_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_center_id" integer,
	"fc_certification_id" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"code" varchar(50),
	"level" varchar(50),
	"domain" varchar(200),
	"status" varchar(50),
	"validity_start" timestamp,
	"validity_end" timestamp,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "french_regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"active" boolean DEFAULT true,
	CONSTRAINT "french_regions_name_unique" UNIQUE("name"),
	CONSTRAINT "french_regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "jury_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"profile_photo_url" text,
	"region" varchar(50) NOT NULL,
	"city" varchar(100),
	"expertise_domains" text[] NOT NULL,
	"certifications" text[],
	"experience_years" integer,
	"current_position" varchar(200),
	"availability_preferences" jsonb,
	"work_modalities" text[],
	"intervention_zones" text[],
	"hourly_rate" numeric(10, 2),
	"bio" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"maintenance_message" text,
	"last_modified_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"siret" varchar(14) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"city" varchar(100),
	"postal_code" varchar(10),
	"region" varchar(50),
	"sector" text,
	"contact_person_name" varchar(255),
	"contact_person_role" varchar(100),
	"is_certificateur" boolean DEFAULT false,
	"certification_domains" text[],
	"subscription_tier" varchar(20) DEFAULT 'gratuit',
	"qualiopi_certified" boolean DEFAULT false,
	"qualiopi_status" text,
	"qualiopi_last_checked" timestamp,
	"france_competence_sync_enabled" boolean DEFAULT false,
	"france_competence_last_sync" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "training_centers_siret_unique" UNIQUE("siret")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" varchar(20) DEFAULT 'centre';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "validation_status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "validation_comment" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "certification_stats" ADD CONSTRAINT "certification_stats_france_competence_certification_id_france_competence_certifications_id_fk" FOREIGN KEY ("france_competence_certification_id") REFERENCES "public"."france_competence_certifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "france_competence_certifications" ADD CONSTRAINT "france_competence_certifications_training_center_id_training_centers_id_fk" FOREIGN KEY ("training_center_id") REFERENCES "public"."training_centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jury_profiles" ADD CONSTRAINT "jury_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_centers" ADD CONSTRAINT "training_centers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;