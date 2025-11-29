import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

export const BlogMetadataSchema = z.object({
    title: z.string(),
    summary: z.string(),
    verdict: z.enum(['True', 'False', 'Misleading', 'Unverified']),
    highlights: z.array(z.string())
});

export async function generateBlogMetadata(claim: string, context: string) {
    const prompt = `
    Analyze the following claim and context to generate metadata for a fact-checking blog post.
    
    Claim: "${claim}"
    
    Context:
    ${context}
    
    Tasks:
    1. Generate a catchy, click-worthy title.
    2. Write a detailed and engaging summary (approx. 80-100 words) of the findings, explaining the context and why the verdict was reached.
    3. Determine the verdict based on the evidence.
    4. Extract 3-5 key highlights or bullet points.
    
    Return strictly JSON.
    `;

    const result = await generateObject({
        model: model,
        prompt: prompt,
        schema: BlogMetadataSchema
    });

    return result.object;
}

export async function generateBlogContent(claim: string, context: string, metadata: any) {
    const prompt = `
    Write a comprehensive, long-form fact-checking blog post (2000+ words) about the claim: "${claim}".
    
    Title: ${metadata.title}
    Verdict: ${metadata.verdict}
    
    Context/Evidence:
    ${context}
    
    Structure:
    1. Introduction: Hook the reader, state the claim, and provide the verdict.
    2. Background: Contextualize the claim (who, what, where, when).
    3. Evidence Analysis: detailed breakdown of the facts, citing the provided context.
    4. Why it matters: The impact of this misinformation (or truth).
    5. Conclusion: Final thoughts and summary.
    
    Tone: Professional, objective, yet engaging and accessible.
    Format: Markdown. Use headers (##, ###), bullet points, and bold text for emphasis.
    `;

    const result = await generateText({
        model: model,
        prompt: prompt
    });

    return result.text;
}
