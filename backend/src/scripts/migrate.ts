import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('Starting database migration...');

        // Read the migration file
        const migrationPath = join(__dirname, '../../migrations/001_initial_schema.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        // Execute the migration
        await db.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('Tables created:');
        console.log('  - User');
        console.log('  - AnalysisJob');
        console.log('Enums created:');
        console.log('  - Category');
        console.log('  - JobStatus');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);

        // Check if tables already exist
        if (error.message.includes('already exists')) {
            console.log('⚠️  Tables already exist. Migration skipped.');
            process.exit(0);
        }

        process.exit(1);
    }
}

runMigration();
