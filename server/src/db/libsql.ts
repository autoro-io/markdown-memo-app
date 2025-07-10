import { drizzle } from 'drizzle-orm/libsql/node';

export const db = drizzle({
  connection: 'file:./libsql.db',
});