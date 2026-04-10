-- Migration: Add avatar and certificate columns for file uploads
ALTER TABLE "users"
ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "tutor_profiles"
ADD COLUMN "certificate" text;
