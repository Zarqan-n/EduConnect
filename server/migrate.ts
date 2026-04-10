import { db } from "./db.ts";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting migration...");
    
    // 1. Rename hourly_rate to monthly_rate
    console.log("Renaming hourly_rate to monthly_rate...");
    await db.execute(sql`ALTER TABLE tutor_profiles RENAME COLUMN hourly_rate TO monthly_rate`);
    
    // 2. Add qualifications column
    console.log("Adding qualifications column...");
    await db.execute(sql`ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS qualifications text`);
    
    // 3. Add languages column
    console.log("Adding languages column...");
    await db.execute(sql`ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS languages text[]`);
    
    // 4. Create institution_profiles table
    console.log("Creating institution_profiles table...");
    await db.execute(sql`
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
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "institution_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
      )
    `);
    
    console.log("✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
