import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { memos } from '../../db/schema';
import { CreateMemoInput, UpdateMemoInput, SelectMemoInput } from '../../db/types';
import { inject, injectable } from 'inversify';
import { MemoRepository } from './memo-repository.interface';
import { eq } from 'drizzle-orm';
import { TYPES } from '@/types';

@injectable()
export class LibsqlMemoRepository implements MemoRepository {
  constructor(
    @inject(TYPES.LibSQLDatabase) private db: LibSQLDatabase
  ) {}

  async createMemo(data: CreateMemoInput): Promise<SelectMemoInput> {
    const [newMemo] = await this.db.insert(memos).values(data).returning();
    return newMemo;
  }

  async updateMemo(memoId: string, data: UpdateMemoInput): Promise<SelectMemoInput> {
    const [updatedMemo] = await this.db.update(memos).set(data).where(eq(memos.id, memoId)).returning();
    if (!updatedMemo) {
      throw new Error("Memo not found");
    }
    return updatedMemo;
  }

  async deleteMemo(memoId: string): Promise<void> {
    await this.db.delete(memos).where(eq(memos.id, memoId));
  }

  async getMemoById(memoId: string): Promise<SelectMemoInput | null> {
    const [memo] = await this.db.select().from(memos).where(eq(memos.id, memoId));
    return memo ?? null;
  }

  async getMemosByUserId(userId: string): Promise<SelectMemoInput[] | null> {
    const userMemos = await this.db.select().from(memos).where(eq(memos.userId, userId));
    return userMemos;
  }

  async getAllMemos(): Promise<SelectMemoInput[]> {
    return await this.db.select().from(memos);
  }
}
