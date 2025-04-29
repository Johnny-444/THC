import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// This script will run migrations to set up the database schema
async function runMigrations() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thcdb';
  
  console.log('Migration starting...');
  console.log(`Using connection string: ${connectionString}`);
  
  // For migrations, we need a new connection instance with higher timeout
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);
  
  try {
    // This will automatically run needed migrations on the database
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection when done
    await migrationClient.end();
  }
}

// Run the migration function
runMigrations();
