import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const defaultConnectionString =
  'postgresql://postgres.wauvvowxxilhssoxixhb:Ostwind0612533468@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const connectionString = process.env.DATABASE_URL || defaultConnectionString;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Disable prepared statements for Supabase Transaction Pooler (port 6543)
const client = globalForDb.conn ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
