import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check if lessonsCompleted column exists
        const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'lessonsCompleted'
    `);

        if (result.rows.length === 0) {
            console.log('❌ Column lessonsCompleted does NOT exist');
            console.log('Running migration...');

            await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS "lessonsCompleted" INTEGER NOT NULL DEFAULT 0;
      `);

            console.log('✅ Migration complete');
        } else {
            console.log('✅ Column lessonsCompleted exists:', result.rows[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

checkSchema();
