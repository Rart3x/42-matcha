import { Pool, PoolClient } from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * @file database.ts
 *
 * @description This file contains the database connection logic. It uses the `pg` library to connect to a Postgresql database.
 * And provides a simple API to execute SQL queries and run code within a transaction context.
 */

const pool = new Pool({
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    database: process.env['DB_NAME'] || 'matcha',
    user: process.env['DB_USER'] || 'matcha',
    password: process.env['DB_PASS'] || 'matcha',
});

const pgClientAsyncLocalStorage = new AsyncLocalStorage<PoolClient>();

/**
 * Wait for the database connection to be ready.
 *
 * @returns {Promise<void>}
 */
export async function ready() {
    while (true) {
        try {
            await pool.query('SELECT 1');
            break;
        } catch (e) {
            console.error('Database connection failed, retrying in 2 seconds');
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}

/**
 * Execute a SQL query. Uses a connection from the pool,
 * or the current transaction if running within a transaction context.
 *
 * @template T The type of the result rows
 * @param query The SQL query to execute
 * @param params The query parameters
 * @returns {Promise<Array<T>>}
 */
export async function sql<T extends Record<string, any>>(
    query: string,
    ...params: any[]
): Promise<Array<T>> {
    const client = pgClientAsyncLocalStorage.getStore();

    if (client) {
        return await client
            .query<T>(query, params)
            .then((result) => result.rows);
    }

    return await pool.query<T>(query, params).then((result) => result.rows);
}

/**
 * Run code within a transaction context. Does start a new transaction if one is already active.
 *
 * @template T The type of the result
 * @param callback The callback to execute within the transaction
 * @returns {Promise<T>} The result of the callback
 */
export function transaction<T>(callback: () => Promise<T>): Promise<T> {
    const client = pgClientAsyncLocalStorage.getStore();

    if (client) {
        return callback();
    }

    return pool.connect().then(async (client) => {
        try {
            await client.query('BEGIN');

            return pgClientAsyncLocalStorage.run(client, async () => {
                const result = await callback();

                await client.query('COMMIT');

                return result;
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    });
}
