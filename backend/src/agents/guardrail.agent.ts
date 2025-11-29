import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google('gemini-2.0-flash');

const GuardrailSchema = z.object({
    isRelevant: z.boolean(),
    reason: z.string().optional(),
    message: z.string()
});

export async function checkRelevance(input: string) {
    console.log(`🛡️ Checking relevance for: ${input.substring(0, 50)}...`);

    const prompt = `
    You are the gatekeeper for "Facta AI", a professional fact-checking and misinformation detection system.
    
    Your goal is to ensure that the user's input is relevant to fact-checking, debunking, or verifying claims.
    
    ### Criteria for RELEVANT input (isRelevant: true):
    - Claims about reality (politics, science, health, history, etc.)
    - News headlines or snippets
    - Rumors or social media posts
    - Questions asking to verify a specific fact ("Is it true that...?")
    - Statements that can be proven true or false
    
    ### Criteria for IRRELEVANT input (isRelevant: false):
    - Simple arithmetic or math problems ("What is 2 + 2?")
    - General greetings or chit-chat ("Hi", "How are you?")
    - Creative writing requests ("Write a poem about...")
    - Coding or technical support questions ("How do I center a div?")
    - Open-ended philosophical questions without factual basis
    - Requests unrelated to truth, facts, or misinformation
    
    ### Output:
    - isRelevant: boolean
    - message: 
        - If RELEVANT: A brief confirmation (e.g., "Processing claim...").
        - If IRRELEVANT: A polite, friendly, and professional refusal. Explain that you are a fact-checking AI and ask the user to provide a claim, news item, or statement they want verified. Be nice!
    
    Input to analyze: "${input}"
    `;

    const result = await generateObject({
        model: model,
        prompt: prompt,
        schema: GuardrailSchema
    });

    return result.object;
}
