import { query, transaction } from '../lib/db.js';
import type { User, CreateUserInput, UpdateUserInput } from '../types/database.js';

export class UserRepository {
    /**
     * Create a new user
     */
    static async create(data: CreateUserInput): Promise<User> {
        const result = await query<User>(
            `INSERT INTO "public"."User" (id, email, "createdAt", "updatedAt")
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
            [data.id, data.email]
        );
        if (!result.rows[0]) {
            throw new Error('Failed to create user');
        }
        return result.rows[0];
    }

    /**
     * Find user by ID
     */
    static async findById(id: string): Promise<User | null> {
        const result = await query<User>(
            `SELECT * FROM "public"."User" WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const result = await query<User>(
            `SELECT * FROM "public"."User" WHERE email = $1`,
            [email]
        );
        return result.rows[0] || null;
    }

    /**
     * Update user
     */
    static async update(id: string, data: UpdateUserInput): Promise<User | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(data.email);
        }

        updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
        values.push(id);

        if (updates.length === 1) {
            // Only updatedAt, no actual changes
            return this.findById(id);
        }

        const result = await query<User>(
            `UPDATE "public"."User" 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    /**
     * Delete user
     */
    static async delete(id: string): Promise<boolean> {
        const result = await query(
            `DELETE FROM "public"."User" WHERE id = $1`,
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Get all users
     */
    static async findAll(limit = 100, offset = 0): Promise<User[]> {
        const result = await query<User>(
            `SELECT * FROM "public"."User" 
       ORDER BY "createdAt" DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    /**
     * Get user with their analysis jobs
     */
    static async findByIdWithJobs(id: string): Promise<any | null> {
        const result = await query(
            `SELECT 
        u.*,
        json_agg(
          json_build_object(
            'id', aj.id,
            'queueJobId', aj."queueJobId",
            'status', aj.status,
            'input', aj.input,
            'scrapedText', aj."scrapedText",
            'category', aj.category,
            'result', aj.result,
            'createdAt', aj."createdAt",
            'updatedAt', aj."updatedAt",
            'userId', aj."userId"
          )
        ) FILTER (WHERE aj.id IS NOT NULL) as "analysisJobs"
       FROM "public"."User" u
       LEFT JOIN "public"."AnalysisJob" aj ON u.id = aj."userId"
       WHERE u.id = $1
       GROUP BY u.id`,
            [id]
        );
        return result.rows[0] || null;
    }
}
