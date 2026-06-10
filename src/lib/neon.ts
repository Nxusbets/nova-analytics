import { neon } from '@neondatabase/serverless';

let queryFn: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (queryFn) return queryFn;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  queryFn = neon(databaseUrl);
  return queryFn;
}
