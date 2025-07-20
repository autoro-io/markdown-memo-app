import { drizzle } from 'drizzle-orm/libsql/web';
import path from 'path';
import { fileURLToPath } from 'url';

import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For local development, use a network-based URL for the libsql client.
// This assumes a libsql server (e.g., turso dev) is running and accessible at this address.
// In production, this would typically be a remote database URL.
const client = createClient({
  url: `file:${path.resolve(__dirname, '../../libsql.db')}`, // Absolute path to packages/libsql.db
});

export const db = drizzle(client);