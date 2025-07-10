import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibsqlMemoRepository } from './libsql-memo-repository';
import { CreateMemoInput, UpdateMemoInput, SelectMemoInput } from '../../db/types';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

// Drizzle ORM のメソッドをモック
const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
} as unknown as LibSQLDatabase;

describe('LibsqlMemoRepository', () => {
  let repository: LibsqlMemoRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new LibsqlMemoRepository(mockDb);
  });

  it('should create a memo', async () => {
    const createMemoInput: CreateMemoInput = { userId: 'user1', content: 'Test Memo' };
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Test Memo', createdAt: new Date(), updatedAt: new Date() };

    // モックの設定
    vi.spyOn(mockDb, 'insert').mockReturnValueOnce({
      values: vi.fn().mockReturnValueOnce({
        returning: vi.fn().mockResolvedValueOnce([expectedMemo]),
      }),
    } as any);

    const result = await repository.createMemo(createMemoInput);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it('should update a memo', async () => {
    const memoId = 'memo1';
    const updateMemoInput: UpdateMemoInput = { content: 'Updated Memo' };
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Updated Memo', createdAt: new Date(), updatedAt: new Date() };

    // モックの設定
    vi.spyOn(mockDb, 'update').mockReturnValueOnce({
      set: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([expectedMemo]),
        }),
      }),
    } as any);

    const result = await repository.updateMemo(memoId, updateMemoInput);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.update).toHaveBeenCalledTimes(1);
  });

  it('should delete a memo', async () => {
    const memoId = 'memo1';

    // モックの設定
    vi.spyOn(mockDb, 'delete').mockReturnValueOnce({
      where: vi.fn().mockResolvedValueOnce(undefined),
    } as any);

    await repository.deleteMemo(memoId);

    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });

  it('should get a memo by id', async () => {
    const memoId = 'memo1';
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Test Memo', createdAt: new Date(), updatedAt: new Date() };

    // モックの設定
    vi.spyOn(mockDb, 'select').mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce([expectedMemo]),
      }),
    } as any);

    const result = await repository.getMemoById(memoId);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });

  it('should return null when memo is not found by id', async () => {
    const memoId = 'not-found';

    // モックの設定
    vi.spyOn(mockDb, 'select').mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce([]),
      }),
    } as any);

    const result = await repository.getMemoById(memoId);

    expect(result).toBeNull();
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });

  it('should get memos by user id', async () => {
    const userId = 'user1';
    const expectedMemos: SelectMemoInput[] = [
      { id: 'memo1', userId: 'user1', content: 'Test Memo 1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'memo2', userId: 'user1', content: 'Test Memo 2', createdAt: new Date(), updatedAt: new Date() },
    ];

    // モックの設定
    vi.spyOn(mockDb, 'select').mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(expectedMemos),
      }),
    } as any);

    const result = await repository.getMemosByUserId(userId);

    expect(result).toEqual(expectedMemos);
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });
});
