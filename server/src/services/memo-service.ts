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

  async getMemoByIdAndUserId(memoId: string, userId: string) {
    const memo = await this.memoRepository.getMemoById(memoId);
    if (!memo || memo.userId !== userId) {
      return null;
    }
    return memo;
  }

  async getMemosByUserId(userId: string) {
    return this.memoRepository.getMemosByUserId(userId);
  }

  async updateMemo(memoId: string, data: UpdateMemoInput, userId: string) {
    const memo = await this.memoRepository.getMemoById(memoId);
    if (!memo || memo.userId !== userId) {
      return null;
    }
    return this.memoRepository.updateMemo(memoId, data);
  }

  async deleteMemo(memoId: string, userId: string) {
    const memo = await this.memoRepository.getMemoById(memoId);
    if (!memo || memo.userId !== userId) {
      return null;
    }
    await this.memoRepository.deleteMemo(memoId);
    return true;
  }
}
