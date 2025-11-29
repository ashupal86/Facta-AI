import { query } from '../lib/db.js';
import { redis } from '../lib/redis.js';
import { index } from '../lib/pinecone.js';

async function clearAllData() {
    try {
        console.log('🗑️ Clearing PostgreSQL data...');
        await query('TRUNCATE TABLE "public"."Blog" CASCADE');
        await query('TRUNCATE TABLE "public"."AnalysisJob" CASCADE');
        // We might want to keep the user 'anonymous' or just recreate it
        await query('TRUNCATE TABLE "public"."User" CASCADE');
        console.log('✅ PostgreSQL cleared.');

        console.log('🗑️ Clearing Redis cache...');
        if (redis.status !== 'ready') {
            await new Promise((resolve) => redis.once('ready', resolve));
        }
        await redis.flushall();
        console.log('✅ Redis cleared.');

        console.log('🗑️ Clearing Pinecone vectors...');
        // Delete all vectors in the namespace or index
        // Pinecone delete all is specific
        try {
            await index.deleteAll();
            console.log('✅ Pinecone cleared.');
        } catch (e) {
            console.error('⚠️ Pinecone clear failed (might be empty):', e);
        }

    } catch (error) {
        console.error('❌ Failed to clear data:', error);
    } finally {
        process.exit(0);
    }
}

clearAllData();
