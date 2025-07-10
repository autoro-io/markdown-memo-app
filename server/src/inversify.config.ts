import { Container } from 'inversify';
import { LibsqlMemoRepository } from './repositories/memo/libsql-memo-repository';
import { MemoRepository } from './repositories/memo/memo-repository.interface';
import { MemoService } from './services/memo-service';
import { TYPES } from './types';

const container = new Container();
container.bind<MemoRepository>(TYPES.MemoRepository).to(LibsqlMemoRepository);
container.bind<MemoService>(TYPES.MemoService).to(MemoService);

export { container };
