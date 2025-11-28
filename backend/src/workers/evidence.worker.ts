import { Job } from 'bullmq';
import type { AnalysisJobData } from '../types/queue.js';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

const EvidenceSchema = z.object({
    evidence: z.array(z.object({
        source: z.string(),
        quote: z.string(),
        relevance: z.number(),
        supports: z.boolean(),
        explanation: z.string()
    }))
});

export async function evidenceExtractionProcessor(job: Job<AnalysisJobData>, searchResults: any[]) {
    console.log(`[Job ${job.id}] Starting evidence extraction...`);

    try {
        // Prepare context from search results
        const context = searchResults.map((r: any, i: number) =>
            `Source ${i + 1} (${r.url}):\n${r.text.substring(0, 1000)}...`
        ).join('\n\n');

        const prompt = `
        Analyze the following search results to find evidence regarding the claim: "${job.data.normalizedClaim || job.data.claim}".
        
        Extract key quotes and facts. Determine if they support or refute the claim.
        
        Search Results:
        ${context}
        `;

        const result = await generateObject({
            model: model,
            prompt: prompt,
            schema: EvidenceSchema
        });

        console.log(`[Job ${job.id}] Extracted ${result.object.evidence.length} pieces of evidence`);

        return {
            step: 'evidence-extraction',
            evidence: result.object.evidence
        };
    } catch (error) {
        console.error(`[Job ${job.id}] Evidence extraction failed:`, error);
        throw error;
    }
}
