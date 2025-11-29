import { Job } from 'bullmq';
import type { AnalysisJobData, AnalysisJobResult } from '../types/queue.js';
import { exaSearchProcessor } from './exa-search.worker.js';
import { evidenceExtractionProcessor } from './evidence.worker.js';
import { analysisProcessor } from './credibility.worker.js';
import { generateVerdict } from '../agents/verdict.agent.js';
import { generateBlogDraft } from '../agents/blog.agent.js';
import { redis } from '../lib/redis.js';
import { upsertVectors } from '../lib/pinecone.js';
import { queryEmbedding } from '../services/ragQuery.js';
import { randomUUID } from 'crypto';
import { AnalysisJobRepository } from '../repositories/analysis-job.repository.js';

const jobRepository = new AnalysisJobRepository();

export async function processAnalysisJob(job: Job<AnalysisJobData>): Promise<AnalysisJobResult> {
    console.log(`[Job ${job.id}] Processing started`);
    const { claim, normalizedClaim, claimHash, category, dbJobId } = job.data;
    const query = normalizedClaim || claim || job.data.input || '';

    try {
        await job.updateProgress(10);

        // 1. Exa Search
        // Adapt job data for exaSearchProcessor if needed, or just pass job
        // exaSearchProcessor expects normalizedClaim etc.
        const searchResult = await exaSearchProcessor(job);
        await job.updateProgress(30);

        // 2. Evidence Extraction
        const evidenceResult = await evidenceExtractionProcessor(job, searchResult.results);
        await job.updateProgress(50);

        // 3. Analysis (Credibility & Contradiction)
        const analysisResult = await analysisProcessor(job, evidenceResult.evidence);
        await job.updateProgress(70);

        // 4. Final Verdict Agent
        const verdict = await generateVerdict(query, evidenceResult.evidence, analysisResult.analysis);
        await job.updateProgress(85);

        // 5. Blog Writer Agent
        const blogDraft = await generateBlogDraft(query, verdict, evidenceResult.evidence);
        await job.updateProgress(95);

        // 6. Save Results
        const finalResult = {
            verdict,
            analysis: analysisResult.analysis,
            evidence: evidenceResult.evidence,
            blogDraft,
            timestamp: new Date().toISOString()
        };

        // Save to Redis Cache
        if (claimHash) {
            const cacheKey = `cache:claim:${claimHash}`;
            await redis.set(cacheKey, JSON.stringify(finalResult), 'EX', 60 * 60 * 24);
        }

        // Save to Pinecone
        try {
            const embedding = await queryEmbedding(query);
            await upsertVectors([[{
                id: randomUUID(),
                values: embedding,
                metadata: {
                    text: query,
                    category: category || 'General',
                    verdict: verdict.verdict,
                    summary: verdict.explanation
                }
            }]]);
        } catch (e) {
            console.error('Pinecone upsert failed:', e);
        }

        // Save to Postgres
        if (dbJobId) {
            try {
                await jobRepository.updateStatus(dbJobId, 'COMPLETED', JSON.stringify(finalResult));
            } catch (e) {
                console.error('Failed to update DB job status:', e);
            }
        }

        console.log(`[Job ${job.id}] Processing complete. Verdict: ${verdict.verdict}`);

        return {
            jobId: job.id || 'unknown',
            status: 'completed',
            result: finalResult
        };

    } catch (error: any) {
        console.error(`[Job ${job.id}] Pipeline failed:`, error);

        if (dbJobId) {
            try {
                await jobRepository.updateStatus(dbJobId, 'FAILED', undefined, error.message);
            } catch (e) {
                console.error('Failed to update DB job status on error:', e);
            }
        }

        throw error;
    }
}
