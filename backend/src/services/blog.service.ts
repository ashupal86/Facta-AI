import { randomUUID } from 'crypto';
import { query } from '../lib/db.js';
import { searchClaim } from './exa.js';
import { upsertVectors, index } from '../lib/pinecone.js';
import { generateBlogMetadata, generateBlogContent } from './gemini.service.js';
import { queryEmbedding } from './ragQuery.js';

export class BlogService {
    static async generateBlog(claim: string) {
        console.log(`Generating blog for claim: ${claim}`);


        // 1. Context Search (Exa)
        const context = await searchClaim(claim);
        // 2. Generate Metadata (Gemini)
        const metadata = await generateBlogMetadata(claim, context);

        // 3. Generate Content (Gemini)
        const content = await generateBlogContent(claim, context, metadata);

        // 4. Store in Postgres
        const blogId = randomUUID();
        const pgResult = await query(
            `INSERT INTO "public"."Blog" (id, title, summary, verdict, claim, content, "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING *`,
            [blogId, metadata.title, metadata.summary, metadata.verdict, claim, content]
        );

        // 5. Store in Pinecone
        // Generate embedding for the content
        const embedding = await queryEmbedding(content);

        await upsertVectors([[{
            id: blogId,
            values: embedding,
            metadata: {
                text: content, // Required by RecordType
                category: 'blog', // Required by RecordType
                blog_id: blogId,
                title: metadata.title,
                created_at: new Date().toISOString()
            } as any // Cast to any to allow extra fields
        }]]);

        return {
            id: blogId,
            title: metadata.title,
            summary: metadata.summary,
            verdict: metadata.verdict,
            created_at: pgResult.rows[0].createdAt,
            stored: true
        };
    }

    static async getList() {
        const result = await query(
            `SELECT id, title, summary, verdict, "createdAt" 
             FROM "public"."Blog" 
             ORDER BY "createdAt" DESC`
        );
        return result.rows;
    }

    static async getById(id: string) {
        // 1. Load metadata from Postgres
        const pgResult = await query(
            `SELECT * FROM "public"."Blog" WHERE id = $1`,
            [id]
        );

        if (pgResult.rows.length === 0) {
            return null;
        }

        const blog = pgResult.rows[0];

        // 2. Try to fetch from Pinecone (Check if exists)
        // Pinecone fetch by ID
        const pcResult = await index.fetch([id]);

        if (pcResult.records && pcResult.records[id]) {
            console.log('✅ Blog content found in Pinecone (and Postgres)');
            // We have the content in Postgres, so we return it.
            // The user requirement says "If found -> return it".
            // Since we stored it in PG, we just return the PG content.
            // But to strictly follow "If NOT found in Pinecone... Re-run",
            // we check existence.
            return {
                ...blog,
                regenerated: false
            };
        }

        // 3. If NOT found in Pinecone (Simulate "Data lost" or "New Context needed")
        console.log('⚠️ Blog content missing in Pinecone. Regenerating...');

        // Re-run Exa search using title
        const newContext = await searchClaim(blog.title);

        // Re-generate content
        const newMetadata = await generateBlogMetadata(blog.claim, newContext); // Refresh metadata? Or just content?
        // User says "Re-generate missing context... Rebuild blog body"
        const newContent = await generateBlogContent(blog.claim, newContext, { ...blog, ...newMetadata });

        // Update Postgres
        await query(
            `UPDATE "public"."Blog" SET content = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
            [newContent, id]
        );

        // Store in Pinecone
        const embedding = await queryEmbedding(newContent);
        await upsertVectors([[{
            id: id,
            values: embedding,
            metadata: {
                text: newContent,
                category: 'blog',
                blog_id: id,
                title: blog.title,
                created_at: new Date().toISOString()
            } as any
        }]]);

        return {
            ...blog,
            content: newContent,
            regenerated: true
        };
    }
}
