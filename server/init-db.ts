import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("🔄 Running database checks...");
    
    // Test database connection
    await db.execute(sql`SELECT 1`);
    console.log("[✓] Database connection successful");
    
    // No need to run migrations here - they are already handled by drizzle-kit push
    // during the build process (render.yaml: npm run db:push)
    console.log("[✓] Database ready (schema already synced using drizzle-kit push)");
    
  } catch (error: any) {
    // Ignore "already exists" errors as migrations may have been partially applied
    if (error?.code === '42710' || error?.message?.includes('already exists')) {
      console.log("[✓] Database already initialized, skipping setup");
      return;
    }
    console.error("[✗] Database initialization failed:", error);
    throw error;
  }
}