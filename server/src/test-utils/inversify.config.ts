import { Container } from 'inversify';
import { MemoRepository } from '../repositories/memo/memo-repository.interface';
import { LibsqlMemoRepository } from '../repositories/memo/libsql-memo-repository';
import { TYPES } from '@/types';
import { MemoService } from '@/services/memo-service';
import { db } from '@/test-utils/setup';

const container = new Container();

container.bind<typeof db>(TYPES.LibSQLDatabase).toConstantValue(db);

// Repositories
container.bind<MemoRepository>(TYPES.MemoRepository).to(LibsqlMemoRepository);

// Services
container.bind<MemoService>(TYPES.MemoService).to(MemoService);

export { container };