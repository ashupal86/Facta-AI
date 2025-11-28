import Exa from 'exa-js';
import { Job } from 'bullmq';
import type { AnalysisJobData } from '../types/queue.js';

// @ts-ignore - exa-js might have issues with ESM import
const exa = new (Exa as any)(process.env.EXA_API_KEY);

export async function exaSearchProcessor(job: Job<AnalysisJobData>) {
    const { normalizedClaim, keywords, claim } = job.data;
    const query = normalizedClaim || claim;

    console.log(`[Job ${job.id}] Starting Exa search for: ${query}`);

    try {
        // Perform search with Exa
        // We want verified news, so we might want to use specific domains or categories if Exa supports it
        // For now, we'll do a general search with high quality content
        const result = await exa.searchAndContents(query, {
            type: 'neural',
            useAutoprompt: true,
            numResults: 5,
            text: true,
            highlights: true
        });

        console.log(`[Job ${job.id}] Exa search found ${result.results.length} results`);

        return {
            step: 'exa-search',
            results: result.results
        };
    } catch (error) {
        console.error(`[Job ${job.id}] Exa search failed:`, error);
        throw error;
    }
}
