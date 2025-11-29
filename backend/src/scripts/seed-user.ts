import { query } from '../lib/db.js';

async function seedUser() {
    try {
        console.log('Checking for anonymous user...');
        const res = await query('SELECT * FROM "public"."User" WHERE id = $1', ['anonymous']);

        if (res.rows.length === 0) {
            console.log('Creating anonymous user...');
            await query(
                `INSERT INTO "public"."User" (id, email, "createdAt", "updatedAt") 
                 VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                ['anonymous', 'anonymous@example.com']
            );
            console.log('✅ Anonymous user created.');
        } else {
            console.log('✅ Anonymous user already exists.');
        }
    } catch (error) {
        console.error('❌ Failed to seed user:', error);
    } finally {
        process.exit(0);
    }
}

seedUser();
