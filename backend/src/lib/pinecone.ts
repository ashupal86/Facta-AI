import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { type RecordType } from "../types/rag.js";

dotenv.config();

export const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const index = pc.index("facta-ai");

export async function upsertVectors(recordChunks: RecordType[][]) {
    for (const chunk of recordChunks) {
        let retries = 3;
        while (retries > 0) {
            try {
                await index.upsert(chunk);
                break;
            } catch (error: any) {
                console.error(`Pinecone upsert failed (retries left: ${retries - 1}):`, error.message);
                retries--;
                if (retries === 0) throw error;
                await new Promise(res => setTimeout(res, 2000 * (4 - retries))); // Exponential backoff
            }
        }
    }
    console.log("data upserted successfully");
}

export async function ragQuery(queryVector: number[], category: string) {
    let retries = 3;
    while (retries > 0) {
        try {
            const queryResponse = await index.query({
                vector: queryVector,
                topK: 5,
                filter: { category: category },
                includeValues: false,
                includeMetadata: true,
            });
            return queryResponse;
        } catch (error: any) {
            console.error(`Pinecone query failed (retries left: ${retries - 1}):`, error.message);
            retries--;
            if (retries === 0) throw error;
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    throw new Error("Pinecone query failed after retries");
}
