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

async function checkUser() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        const result = await client.query('SELECT id, email, name FROM users WHERE email = $1', ['demo@mivo.app']);

        if (result.rows.length === 0) {
            console.log('❌ User demo@mivo.app NOT found');
        } else {
            console.log('✅ User found:', result.rows[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

checkUser();
