import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

const VerdictSchema = z.object({
    verdict: z.enum(['True', 'False', 'Misleading', 'Unverified']),
    confidence: z.number().min(0).max(100),
    explanation: z.string(),
    keyEvidence: z.array(z.string())
});

export async function generateVerdict(claim: string, evidence: any[], analysis: any) {
    console.log(`Generating final verdict for: ${claim}`);

    const evidenceText = evidence.map((e: any) =>
        `- ${e.quote} (Source: ${e.source})`
    ).join('\n');

    const prompt = `
    Based on the gathered evidence and analysis, determine the final verdict for the claim: "${claim}".
    
    Analysis:
    - Credibility Score: ${analysis.credibilityScore}
    - Contradictions: ${analysis.contradictions.join(', ')}
    
    Evidence:
    ${evidenceText}
    
    Provide a verdict (True, False, Misleading, Unverified), a confidence score, and a detailed explanation.
    `;

    const result = await generateObject({
        model: model,
        prompt: prompt,
        schema: VerdictSchema
    });

    return result.object;
}
