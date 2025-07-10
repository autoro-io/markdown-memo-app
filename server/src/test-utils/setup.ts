import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "node:path";

// Database
const client = createClient({
  url: ':memory:',
});

const db = drizzle(client);

// Migrations
import { migrate } from "drizzle-orm/libsql/migrator";

async function setupDatabase() {
  console.log("Setting up database...");
  const migrationsPath = path.join(process.cwd(), 'db');
  await migrate(db, { migrationsFolder: migrationsPath });
}

setupDatabase().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});

export { db };