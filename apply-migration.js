import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sqlFile = join(__dirname, 'migrations', '0000_brief_amphibian.sql');
const sql = readFileSync(sqlFile, 'utf8');

const client = new Client({ connectionString: databaseUrl });

(async () => {
  try {
    await client.connect();
    console.log('Connected to Supabase');
    
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
