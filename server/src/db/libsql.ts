import { drizzle } from 'drizzle-orm/libsql';

export const db = drizzle({
  connection: 'file:./libsql.db',
});