import { ClaimNormalizationService } from '../services/normalization.service.js';
import { QueueService, WorkerService } from '../services/queue.js';
import { BlogService } from '../services/blog.service.js';
import { redis, closeRedisConnection } from '../lib/redis.js';
import { query } from '../lib/db.js';

async function testFullPipeline() {
    console.log('--- Testing Full Pipeline (Fact Check + Background Blog) ---');

    const claim = "The Great Wall of China is visible from space.";

    try {
        // 1. Submit Claim
        console.log(`\n1. Submitting claim: "${claim}"`);
        const result = await ClaimNormalizationService.processClaim(claim);

        if (result.status === 'rejected') {
            console.error('❌ Claim rejected by guardrail:', result.message);
            return;
        }

        if (result.status !== 'queued') {
            console.log('ℹ️ Claim processed immediately (cached?):', result.status);
            return;
        }

        const jobId = result.jobId as string;
        console.log(`✅ Job queued with ID: ${jobId}`);

        // Ensure worker is running for the test
        console.log('🚀 Starting local worker for test...');
        await WorkerService.startWorker();

        // 2. Poll for Fact Check Result
        console.log('\n2. Polling for fact check result...');
        let analysisComplete = false;

        const startTime = Date.now();
        while (Date.now() - startTime < 120000) { // 120s timeout
            const status = await QueueService.getJobStatus(jobId);

            if (status.metadata.state === 'active') {
                process.stdout.write('🔄'); // Active
            } else if (status.metadata.state === 'waiting') {
                process.stdout.write('⏳'); // Waiting
            }

            if (status.metadata.state === 'completed') {
                console.log('\n✅ Fact check completed!');
                console.log('Verdict:', status.analysis.result.verdict.verdict);
                analysisComplete = true;
                break;
            }

            if (status.metadata.state === 'failed') {
                console.error('\n❌ Job failed:', status.failedReason);
                break;
            }

            await new Promise(r => setTimeout(r, 2000));
        }

        if (!analysisComplete) {
            console.error('❌ Fact check timed out.');
            return;
        }

        // 3. Check for Background Blog Generation
        console.log('\n3. Waiting for background blog generation...');
        console.log('(This might take a few seconds as it runs after the job completes)');

        let blogFound = false;
        const blogStartTime = Date.now();

        while (Date.now() - blogStartTime < 60000) { // 60s timeout for blog
            // Check DB directly
            const res = await query('SELECT * FROM "public"."Blog" WHERE claim = $1', [claim]);

            if (res.rows.length > 0) {
                console.log('✅ Blog found in database!');
                console.log('Title:', res.rows[0].title);
                console.log('Summary:', res.rows[0].summary);
                blogFound = true;
                break;
            }

            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!blogFound) {
            console.error('\n❌ Blog generation timed out or failed.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

async function main() {
    await testFullPipeline();
    await closeRedisConnection();
    process.exit(0);
}

main();
