import { Pool } from 'pg';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 30000, // Return an error after 30 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process in dev, just log
    if (process.env.NODE_ENV === 'production') {
        process.exit(-1);
    }
});

/**
 * Execute a query with parameters
 */
export const query = async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> => {
    const start = Date.now();
    let retries = 3;

    while (retries > 0) {
        try {
            const result = await pool.query<T>(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV === 'development') {
                console.log('Executed query', { text, duration, rows: result.rowCount });
            }

            return result;
        } catch (error: any) {
            console.error(`Database query error (retries left: ${retries - 1}):`, error.message);

            // Retry on connection errors
            if (error.message.includes('timeout') || error.message.includes('Connection terminated') || error.message.includes('ECONNREFUSED')) {
                retries--;
                if (retries === 0) throw error;
                await new Promise(res => setTimeout(res, 1000)); // Wait 1s before retry
                continue;
            }

            throw error;
        }
    }
    throw new Error('Database query failed after retries');
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
    return await pool.connect();
};

/**
 * Execute a transaction
 */
export const transaction = async <T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Close the pool (useful for graceful shutdown)
 */
export const closePool = async (): Promise<void> => {
    await pool.end();
};

export default {
    query,
    getClient,
    transaction,
    closePool,
    pool,
};
