import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  // UUID が理想だが、SQLite では UUID を直接サポートしていないため、テキスト型で代用
  id: text('id').primaryKey().$default(() => sql`(lower(hex(randomblob(16))))`),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull().$onUpdate(() => new Date()),
});

export const memos = sqliteTable('memos', {
  // UUID が理想だが、SQLite では UUID を直接サポートしていないため、テキスト型で代用
  id: text('id').primaryKey().$default(() => sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull().default(""),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`).notNull().$onUpdate(() => new Date()),
});

