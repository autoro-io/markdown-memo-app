import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull().$onUpdate(() => sql`(unixepoch())`),
});

export const memos = sqliteTable('memos', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull().default(""),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull().$onUpdate(() => sql`(unixepoch())`),
});

