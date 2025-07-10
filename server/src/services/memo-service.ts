import { inject, injectable } from 'inversify';
import { MemoRepository } from '../repositories/memo/memo-repository.interface';
import { CreateMemoInput, UpdateMemoInput } from '../db/types';
import { TYPES } from '@/types';

@injectable()
export class MemoService {
  constructor(
    @inject(TYPES.MemoRepository) private memoRepository: MemoRepository
  ) {}

  async createMemo(data: CreateMemoInput) {
    return this.memoRepository.createMemo(data);
  }

  async getMemoById(memoId: string) {
    return this.memoRepository.getMemoById(memoId);
  }

  async getMemosByUserId(userId: string) {
    return this.memoRepository.getMemosByUserId(userId);
  }

  async updateMemo(memoId: string, data: UpdateMemoInput) {
    return this.memoRepository.updateMemo(memoId, data);
  }

  async deleteMemo(memoId: string) {
    return this.memoRepository.deleteMemo(memoId);
  }
}
