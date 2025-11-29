import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('Starting database migration...');

        const migrationPath2 = join(__dirname, '../../migrations/002_create_blog_table.sql');
        const migrationSQL2 = readFileSync(migrationPath2, 'utf-8');

        // Execute the migrations
        await db.query(migrationSQL2);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        if (error.message.includes('already exists')) {
            console.log('⚠️  Tables already exist. Migration skipped.');
            process.exit(0);
        }
        process.exit(1);
    }
}

runMigration();
