import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const migrationFile = process.argv[2] || '0003_add_avatar_certificate.sql';
const sqlFile = join(__dirname, 'migrations', migrationFile);
const sql = readFileSync(sqlFile, 'utf8');

const client = new Client({ connectionString: databaseUrl });

(async () => {
  try {
    await client.connect();
    console.log(`Connected to database`);
    
    // Split SQL by statement breaks and execute
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await client.query(statement);
      }
    }
    
    console.log('✓ Migration applied successfully');
    await client.end();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
