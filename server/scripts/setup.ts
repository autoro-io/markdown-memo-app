import { container } from "../src/inversify.config";
import { TYPES } from "../src/types";
import { db } from "../src/db/libsql";
import * as schema from "../src/db/schema";
import { MemoService } from "../src/services/memo-service";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create database
await migrate(db, {
  migrationsFolder: "./db",
})

// Seed Data
const users = await db.select().from(schema.users);
if (users.length === 0) {
  // Insert User
  await db.insert(schema.users).values({
    id: "user1",
    name: "Test User",
  });
  await db.insert(schema.users).values({
    id: "user2",
    name: "Another User",
  });
}

// Insert Memos
const memoService = container.get<MemoService>(TYPES.MemoService);
const memo1 = fs.readFileSync(path.join(__dirname, "./memo1.md"), "utf-8");
const memo2 = fs.readFileSync(path.join(__dirname, "./memo2.md"), "utf-8");
const memo3 = fs.readFileSync(path.join(__dirname, "./memo3.md"), "utf-8");

await memoService.createMemo({ userId: "user1", content: memo1 });
await memoService.createMemo({ userId: "user1", content: memo2 });
await memoService.createMemo({ userId: "user2", content: memo3 });
