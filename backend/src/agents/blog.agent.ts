import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

export async function generateBlogDraft(claim: string, verdict: any, evidence: any[]) {
    console.log(`Generating blog draft for: ${claim}`);

    const evidenceText = evidence.map((e: any) =>
        `- ${e.quote} (Source: ${e.source})`
    ).join('\n');

    const prompt = `
    Write a comprehensive fact-check article about the claim: "${claim}".
    
    Verdict: ${verdict.verdict}
    Confidence: ${verdict.confidence}%
    Explanation: ${verdict.explanation}
    
    Evidence:
    ${evidenceText}
    
    The article should be engaging, informative, and structured with headings. 
    Include a summary, the claim analysis, evidence breakdown, and the final conclusion.
    Format in Markdown.
    `;

    const result = await generateText({
        model: model,
        prompt: prompt,
    });

    return result.text;
}
