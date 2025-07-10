import 'reflect-metadata';
import { Container } from 'inversify';
import { LibsqlMemoRepository } from './repositories/memo/libsql-memo-repository';
import { MemoRepository } from './repositories/memo/memo-repository.interface';
import { MemoService } from './services/memo-service';
import { TYPES } from './types';
import { db } from './db/libsql';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

const container = new Container();
container.bind<MemoRepository>(TYPES.MemoRepository).to(LibsqlMemoRepository);
container.bind<MemoService>(TYPES.MemoService).to(MemoService);
container.bind<LibSQLDatabase>(TYPES.LibSQLDatabase).toConstantValue(db); 
export { container };
