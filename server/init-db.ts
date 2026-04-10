import { migrate } from "drizzle-orm/node-postgres/migrator";
import { pool, db } from "./db";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initializeDatabase() {
  try {
    console.log("🔄 Running database migrations...");
    
    const migrationsFolder = path.resolve(__dirname, "../migrations");
    await migrate(db, { migrationsFolder });
    
    console.log("✅ Database migrations completed successfully");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error;
  }
}
