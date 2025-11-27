import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log('✅ Connected to production database');

        // Add lessonsCompleted column if it doesn't exist
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "lessonsCompleted" INTEGER NOT NULL DEFAULT 0;
    `);

        console.log('✅ Migration complete: lessonsCompleted column added');

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await client.end();
    }
}

migrate();
