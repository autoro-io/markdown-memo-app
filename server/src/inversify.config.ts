import { Container } from 'inversify';
import { LibsqlMemoRepository } from './repositories/memo/libsql-memo-repository';
import { MemoRepository } from './repositories/memo/memo-repository.interface';

export const TYPES = {
  MemoRepository: Symbol.for('MemoRepository'),
  UserRepository: Symbol.for('UserRepository'),
}

const container = new Container();
container.bind<MemoRepository>(TYPES.MemoRepository).to(LibsqlMemoRepository);

export { container };
