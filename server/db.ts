import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

// import { drizzle } from "drizzle-orm/node-postgres";
// import pg from "pg";
// import * as schema from "@shared/schema";

// const { Pool } = pg;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// // Configure SSL for production databases (Render Postgres requires SSL)
// const sslOption: any = process.env.PGSSLMODE
//   ? { rejectUnauthorized: process.env.PGSSLMODE === 'disable' ? false : true }
//   : process.env.NODE_ENV === 'production'
//   ? { rejectUnauthorized: false }
//   : false;

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: sslOption });
// export const db = drizzle(pool, { schema });
