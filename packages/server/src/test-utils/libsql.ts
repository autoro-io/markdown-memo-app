import { drizzle } from "drizzle-orm/libsql";
// Database
const db = drizzle({
  connection: ':memory:',
});

export { db };