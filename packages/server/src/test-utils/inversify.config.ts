import { container } from '@/inversify.config';
import { TYPES } from '@/types';
import { db as testDb } from './libsql';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

await container.unbind(TYPES.LibSQLDatabase);
container.bind<LibSQLDatabase>(TYPES.LibSQLDatabase).toConstantValue(testDb);

export { container };