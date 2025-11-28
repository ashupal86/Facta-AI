import { query } from '../lib/db.js';
import type {
    AnalysisJob,
    CreateAnalysisJobInput,
    UpdateAnalysisJobInput,
} from '../types/database.js';
import { JobStatus, Category } from '../types/database.js';

export class AnalysisJobRepository {
    /**
     * Create a new analysis job
     */
    static async create(data: CreateAnalysisJobInput): Promise<AnalysisJob> {
        const result = await query<AnalysisJob>(
            `INSERT INTO "public"."AnalysisJob" 
       (id, input, "userId", "queueJobId", status, "scrapedText", category, result, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
            [
                data.id,
                data.input,
                data.userId,
                data.queueJobId || null,
                data.status || JobStatus.PENDING,
                data.scrapedText || null,
                data.category || null,
                data.result ? JSON.stringify(data.result) : null,
            ]
        );
        if (!result.rows[0]) {
            throw new Error('Failed to create analysis job');
        }
        return result.rows[0];
    }

    /**
     * Find analysis job by ID
     */
    static async findById(id: string): Promise<AnalysisJob | null> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Find analysis job by queue job ID
     */
    static async findByQueueJobId(queueJobId: string): Promise<AnalysisJob | null> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" WHERE "queueJobId" = $1`,
            [queueJobId]
        );
        return result.rows[0] || null;
    }

    /**
     * Update analysis job
     */
    static async update(id: string, data: UpdateAnalysisJobInput): Promise<AnalysisJob | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.queueJobId !== undefined) {
            updates.push(`"queueJobId" = $${paramCount++}`);
            values.push(data.queueJobId);
        }

        if (data.status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(data.status);
        }

        if (data.scrapedText !== undefined) {
            updates.push(`"scrapedText" = $${paramCount++}`);
            values.push(data.scrapedText);
        }

        if (data.category !== undefined) {
            updates.push(`category = $${paramCount++}`);
            values.push(data.category);
        }

        if (data.result !== undefined) {
            updates.push(`result = $${paramCount++}`);
            values.push(JSON.stringify(data.result));
        }

        updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
        values.push(id);

        if (updates.length === 1) {
            // Only updatedAt, no actual changes
            return this.findById(id);
        }

        const result = await query<AnalysisJob>(
            `UPDATE "public"."AnalysisJob" 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    /**
     * Delete analysis job
     */
    static async delete(id: string): Promise<boolean> {
        const result = await query(
            `DELETE FROM "public"."AnalysisJob" WHERE id = $1`,
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Find all jobs for a user
     */
    static async findByUserId(
        userId: string,
        limit = 100,
        offset = 0
    ): Promise<AnalysisJob[]> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" 
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    /**
     * Find jobs by status
     */
    static async findByStatus(
        status: JobStatus,
        limit = 100,
        offset = 0
    ): Promise<AnalysisJob[]> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" 
       WHERE status = $1
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
            [status, limit, offset]
        );
        return result.rows;
    }

    /**
     * Find jobs by category
     */
    static async findByCategory(
        category: Category,
        limit = 100,
        offset = 0
    ): Promise<AnalysisJob[]> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" 
       WHERE category = $1
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
            [category, limit, offset]
        );
        return result.rows;
    }

    /**
     * Get analysis job with user information
     */
    static async findByIdWithUser(id: string): Promise<any | null> {
        const result = await query(
            `SELECT 
        aj.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) as user
       FROM "public"."AnalysisJob" aj
       INNER JOIN "public"."User" u ON aj."userId" = u.id
       WHERE aj.id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Get all jobs
     */
    static async findAll(limit = 100, offset = 0): Promise<AnalysisJob[]> {
        const result = await query<AnalysisJob>(
            `SELECT * FROM "public"."AnalysisJob" 
       ORDER BY "createdAt" DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    /**
     * Count jobs by status for a user
     */
    static async countByStatusForUser(
        userId: string,
        status: JobStatus
    ): Promise<number> {
        const result = await query<{ count: string }>(
            `SELECT COUNT(*) as count 
       FROM "public"."AnalysisJob" 
       WHERE "userId" = $1 AND status = $2`,
            [userId, status]
        );
        return parseInt(result.rows[0]?.count || '0', 10);
    }
}
