import { drizzle } from 'drizzle-orm/libsql/web';

import { createClient } from '@libsql/client';

// For local development, use a network-based URL for the libsql client.
// This assumes a libsql server (e.g., turso dev) is running and accessible at this address.
// In production, this would typically be a remote database URL.
const client = createClient({
  url: 'file:../../libsql.db', // Adjust the path as necessary for your project structure
});

export const db = drizzle(client);