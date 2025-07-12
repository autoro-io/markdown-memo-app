import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import path from "node:path";
import { db } from "./libsql";

console.log("Database initialized.", db);
// Migrations
import { migrate } from "drizzle-orm/libsql/migrator";

async function setupDatabase() {
  console.log("Setting up database...");
  const migrationsPath = path.join(process.cwd(), 'db');
  await migrate(db, { migrationsFolder: migrationsPath });
  console.log("Database setup complete.");
}

await setupDatabase().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});