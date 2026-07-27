import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<boolean, boolean> | null = null;

// Initialize Neon DB connection if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    sql = neon(process.env.DATABASE_URL);
    console.log('[NEON DB] Serverless PostgreSQL client connected successfully.');
  } catch (error) {
    console.error('[NEON DB ERROR] Failed to initialize Neon PostgreSQL connection:', error);
  }
} else {
  console.log('[NEON DB NOTICE] DATABASE_URL is not set in .env. Operating in high-performance local memory database mode.');
}

export const getNeonClient = () => sql;

export const isNeonConnected = (): boolean => sql !== null;

/**
 * Execute query against Neon PostgreSQL with fallback
 */
export async function queryNeon<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  if (!sql) {
    throw new Error('Neon DB is not connected. Add DATABASE_URL to your .env file.');
  }
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('[NEON QUERY ERROR]', error);
    throw error;
  }
}
