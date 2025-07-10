import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './db',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
});