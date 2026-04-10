-- Migration: Add institution_profiles table and update tutor_profiles
ALTER TABLE tutor_profiles
RENAME COLUMN hourly_rate TO monthly_rate;--> statement-breakpoint
ALTER TABLE tutor_profiles
ADD COLUMN IF NOT EXISTS qualifications text;--> statement-breakpoint
ALTER TABLE tutor_profiles
ADD COLUMN IF NOT EXISTS languages text[];--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "institution_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"institution_name" text NOT NULL,
	"website" text,
	"type" text,
	"director_name" text,
	"contact_person" text,
	"staff_count" integer DEFAULT 0,
	"founded_year" integer,
	"specializations" text[],
	"description" text,
	"accreditation" text,
	"rating" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint
ALTER TABLE "institution_profiles" ADD CONSTRAINT "institution_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;