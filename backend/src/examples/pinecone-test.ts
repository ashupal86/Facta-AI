import { upsertVectors, ragQuery, pc } from "../lib/pinecone.js";
import type { RecordType } from "../types/rag.js";
import { randomUUID } from "crypto";

async function testPinecone() {
    try {
        console.log("Starting Pinecone test...");

        const indexName = "facta-ai";

        // 0. Ensure Index Exists
        console.log("Checking if index exists...");
        const existingIndexes = await pc.listIndexes();
        const indexExists = existingIndexes.indexes?.some(i => i.name === indexName);

        if (!indexExists) {
            console.log(`Index '${indexName}' not found. Creating it...`);
            try {
                await pc.createIndex({
                    name: indexName,
                    dimension: 3072, // Matches gemini-embedding-001 config
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });
                console.log("Index creation initiated. Waiting 60 seconds for initialization...");
                await new Promise(resolve => setTimeout(resolve, 60000));
            } catch (createError) {
                console.error("Failed to create index automatically. You may need to create it manually in the Pinecone console.");
                console.error("Required config: Name: facta-ai, Dimensions: 3072, Metric: cosine");
                throw createError;
            }
        } else {
            console.log(`Index '${indexName}' already exists.`);
        }

        // 1. Create dummy data
        const id = randomUUID();
        const vector = new Array(3072).fill(0).map(() => Math.random()); // 3072 dimensions
        const category = "TEST_CATEGORY";

        const record: RecordType = {
            id: id,
            values: vector,
            metadata: {
                text: "This is a test record for Pinecone integration.",
                category: category
            }
        };

        // 2. Upsert data
        console.log("Upserting data...");
        // upsertVectors expects RecordType[][] (chunks of records)
        await upsertVectors([[record]]);
        console.log("Upsert successful!");

        // Wait a bit for consistency (Pinecone is eventually consistent)
        console.log("Waiting 10 seconds for consistency...");
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 3. Query data
        console.log("Querying data...");
        const results = await ragQuery(vector, category);

        console.log("Query results:", JSON.stringify(results, null, 2));

        if (results.matches && results.matches.length > 0) {
            console.log("✅ Test Passed: Found matches!");
            const match = results.matches.find(m => m.id === id);
            if (match) {
                console.log("✅ Found exact inserted record!");
            } else {
                console.log("⚠️ Did not find the exact record, but found matches.");
            }
        } else {
            console.error("❌ Test Failed: No matches found.");
        }

    } catch (error) {
        console.error("❌ Test Failed with error:", error);
        process.exit(1);
    }
}

testPinecone();
