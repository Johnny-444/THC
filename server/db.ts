import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thcdb';

// Create a PostgreSQL client
const client = postgres(connectionString);

// Initialize Drizzle with the PostgreSQL client
export const db = drizzle(client, { schema });
