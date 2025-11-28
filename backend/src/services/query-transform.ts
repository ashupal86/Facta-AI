import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google("gemini-1.5-flash");

export const NormalizedClaimSchema = z.object({
    normalized_claim: z.string(),
    category: z.enum([
        "Politics",
        "Health",
        "Science",
        "Technology",
        "Economics",
        "Sports",
        "Entertainment",
        "Environment",
        "Education",
        "Social Issues",
        "Breaking News",
        "Historical Claims",
        "Statistics",
        "Government Policy",
        "International Affairs",
        "Other",
    ]),
    keywords: z.array(z.string()),
    question: z.string(),
});

const SYSTEM_PROMPT = `
You are a precise, neutral, and structured AI assistant embedded in a misinformation detection pipeline.

Your objective is to analyze user input (such as news articles, headlines, social media posts, or claims) and extract structured information that can assist in downstream fact-checking tasks.

### Your tasks:

1. **Normalize the Claim**:
   - Extract the core claim from the user input.
   - Rephrase it into a clear, concise, and neutral statement (\`normalized_claim\`).

2. **Categorize Content**:
   - Classify the input into the single most relevant category that helps with fact-checking prioritization.
   - Choose exactly ONE from these categories: "Politics", "Health", "Science", "Technology", "Economics", "Sports", "Entertainment", "Environment", "Education", "Social Issues", "Breaking News", "Historical Claims", "Statistics", "Government Policy", "International Affairs", "Other".

3. **Extract Keywords**:
   - Identify key terms, entities, tags, and important words from the query (\`keywords\`).
   - Include names of people, organizations, places, and specific concepts.

4. **Generate Question**:
   - Transform the user's query or claim into a direct, fact-checkable question (\`question\`).
   - This question should be suitable for querying a knowledge base or search engine to verify the claim.

---

### Output Format:
Respond strictly in this JSON structure matching the schema:

{
  normalized_claim: "string",
  category: "string",
  keywords: ["string", "string"],
  question: "string"
}
`;

export async function transformQuery(query: string) {
    try {
        const result = await generateObject({
            model: model,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: query }],
            schema: NormalizedClaimSchema,
        });

        return result.object;
    } catch (error) {
        console.error("Error in transformQuery:", error);
        return {
            success: false,
            error: "Failed to process query transformation",
        };
    }
}
