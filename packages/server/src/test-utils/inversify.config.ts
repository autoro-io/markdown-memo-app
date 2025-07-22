import { container } from '@/server/inversify.config';
import { TYPES } from '@/server/types';
import { db as testDb } from './libsql';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

await container.unbind(TYPES.LibSQLDatabase);
container.bind<LibSQLDatabase>(TYPES.LibSQLDatabase).toConstantValue(testDb);

export { container };