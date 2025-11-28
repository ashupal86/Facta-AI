import { createHash } from 'crypto';
import { transformQuery } from './query-transform.js';
import { redis } from '../lib/redis.js';
import { index as pineconeIndex, ragQuery } from '../lib/pinecone.js';
import { QueueService } from '../services/queue.js';
import { randomUUID } from 'crypto';

export class ClaimNormalizationService {
    /**
     * Entry point for the analysis pipeline
     */
    static async processClaim(input: string) {
        console.log(`Processing claim: ${input.substring(0, 50)}...`);

        // 1. Normalize and Transform
        const transformed = await transformQuery(input);

        // Handle potential failure in transformation
        if ('error' in transformed) {
            throw new Error(`Failed to transform query: ${transformed.error}`);
        }

        // We know it's the success schema now
        const { normalized_claim, category, keywords, question } = transformed as any; // Cast because transformQuery return type is generic/inferred

        // 2. Generate Claim Hash (SHA256)
        const claimHash = createHash('sha256').update(normalized_claim).digest('hex');
        console.log(`Generated hash: ${claimHash}`);

        // 3. Check Redis Hot Cache
        const cacheKey = `cache:claim:${claimHash}`;
        const cachedVerdict = await redis.get(cacheKey);

        if (cachedVerdict) {
            console.log('CACHE HIT: Returning cached verdict');
            return {
                status: 'cached',
                result: JSON.parse(cachedVerdict),
                claimHash,
                normalized_claim
            };
        }

        console.log('CACHE MISS: Proceeding to semantic search and analysis');

        // 4. Semantic Search (Pinecone)
        // We'll do this as part of the orchestration or here. 
        // The flowchart says: Cache Miss -> Pinecone Semantic Ops -> Orchestration
        // Let's fetch context here to pass to the job.

        // We need an embedding for the normalized claim to query Pinecone
        // We'll use the ragQuery service we created earlier (or import it)
        // Wait, ragQuery in pinecone.ts takes a vector. We need to generate it first.
        // We should import queryEmbedding from ragQuery.ts

        // For now, let's trigger the orchestration job. The worker can handle the heavy lifting 
        // or we can do the semantic search here if we want to fail fast.
        // Given the flowchart, "Pinecone Semantic Expand" feeds into "FastAPI Orchestration".
        // So we should probably do it here or in the first step of the job.

        // Let's queue the job.
        const jobId = randomUUID();

        const job = await QueueService.addJob({
            userId: 'anonymous', // Default user ID
            inputType: 'text',   // Default input type
            input: input,        // Raw input
            // Legacy fields for compatibility
            claim: input,
            normalizedClaim: normalized_claim,
            category: category,
            keywords: keywords,
            question: question,
            claimHash: claimHash,
            dbJobId: jobId // Pass the UUID as dbJobId
        });

        return {
            status: 'queued',
            jobId: job.id, // Return BullMQ Job ID for polling
            dbJobId: jobId, // Return UUID for reference
            claimHash,
            normalized_claim
        };
    }
}
