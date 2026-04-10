import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import path from "path";

export async function initializeDatabase() {
  try {
    console.log("🔄 Running database migrations...");
    
    const migrationsFolder = path.resolve(process.cwd(), "migrations");
    await migrate(db, { migrationsFolder });
    
    console.log("✅ Database migrations completed successfully");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error;
  }
}
