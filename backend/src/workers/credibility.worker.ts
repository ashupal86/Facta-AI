import { Job } from 'bullmq';
import type { AnalysisJobData } from '../types/queue.js';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

const AnalysisSchema = z.object({
    credibilityScore: z.number().min(0).max(100),
    credibilityReasoning: z.string(),
    contradictions: z.array(z.string()),
    isContradictory: z.boolean()
});

export async function analysisProcessor(job: Job<AnalysisJobData>, evidence: any[]) {
    console.log(`[Job ${job.id}] Starting analysis (credibility & contradiction)...`);

    try {
        const evidenceText = evidence.map((e: any) =>
            `Quote: "${e.quote}"\nSource: ${e.source}\nSupports Claim: ${e.supports}`
        ).join('\n\n');

        const prompt = `
        Analyze the credibility of the sources and check for contradictions regarding the claim: "${job.data.normalizedClaim || job.data.claim}".
        
        Evidence:
        ${evidenceText}
        
        1. Assign a credibility score (0-100) based on the quality of sources.
        2. Identify any contradictions between the claim and the evidence, or among the evidence itself.
        `;

        const result = await generateObject({
            model: model,
            prompt: prompt,
            schema: AnalysisSchema
        });

        console.log(`[Job ${job.id}] Analysis complete. Score: ${result.object.credibilityScore}`);

        return {
            step: 'analysis',
            analysis: result.object
        };
    } catch (error) {
        console.error(`[Job ${job.id}] Analysis failed:`, error);
        throw error;
    }
}
