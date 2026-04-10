import { db } from "./db.ts";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting job timing migration...");
    
    // Add working_time_start column
    console.log("Adding working_time_start column...");
    await db.execute(sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_time_start text`);
    
    // Add working_time_end column
    console.log("Adding working_time_end column...");
    await db.execute(sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_time_end text`);
    
    // Add working_days column
    console.log("Adding working_days column...");
    await db.execute(sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_days text`);
    
    console.log("✓ Job timing migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
