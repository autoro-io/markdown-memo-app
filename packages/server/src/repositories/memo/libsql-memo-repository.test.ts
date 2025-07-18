import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibsqlMemoRepository } from './libsql-memo-repository';
import { CreateMemoInput, UpdateMemoInput, SelectMemoInput } from '../../db/types';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../../db/schema'; // schemaをインポート

// --- モックの準備 ---
// Drizzleの各メソッドをモックします。
const mockDb = {
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
} as unknown as LibSQLDatabase;


describe('LibsqlMemoRepository', () => {
  let repository: LibsqlMemoRepository;

  beforeEach(() => {
    // 各テストの前にすべてのモックをリセットします。
    vi.mocked(mockDb.insert).mockClear();
    vi.mocked(mockDb.update).mockClear();
    vi.mocked(mockDb.delete).mockClear();
    vi.mocked(mockDb.select).mockClear();
    
    repository = new LibsqlMemoRepository(mockDb);
  });

  it('should create a memo', async () => {
    const createMemoInput: CreateMemoInput = { userId: 'user1', content: 'Test Memo' };
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Test Memo', createdAt: new Date(), updatedAt: new Date() };

    const returningMock = vi.fn().mockResolvedValueOnce([expectedMemo]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    vi.mocked(mockDb.insert).mockReturnValue({
      values: valuesMock,
    } as unknown as ReturnType<typeof mockDb.insert>);

    const result = await repository.createMemo(createMemoInput);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.insert).toHaveBeenCalledWith(schema.memos);
    expect(valuesMock).toHaveBeenCalledWith(createMemoInput);
    expect(returningMock).toHaveBeenCalled();
  });

  it('should update a memo', async () => {
    const memoId = 'memo1';
    const updateMemoInput: UpdateMemoInput = { content: 'Updated Memo' };
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Updated Memo', createdAt: new Date(), updatedAt: new Date() };

    const returningMock = vi.fn().mockResolvedValueOnce([expectedMemo]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(mockDb.update).mockReturnValue({
      set: setMock,
    } as unknown as ReturnType<typeof mockDb.update>);

    const result = await repository.updateMemo(memoId, updateMemoInput);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.update).toHaveBeenCalledWith(schema.memos);
    expect(setMock).toHaveBeenCalledWith(expect.objectContaining(updateMemoInput));
    expect(whereMock).toHaveBeenCalled();
    expect(returningMock).toHaveBeenCalled();
  });

  it('should delete a memo', async () => {
    const memoId = 'memo1';

    const whereMock = vi.fn().mockResolvedValueOnce(undefined);
    vi.mocked(mockDb.delete).mockReturnValue({
      where: whereMock,
    } as unknown as ReturnType<typeof mockDb.delete>);

    await repository.deleteMemo(memoId);

    expect(mockDb.delete).toHaveBeenCalledWith(schema.memos);
    expect(whereMock).toHaveBeenCalled();
  });

  it('should get a memo by id', async () => {
    const memoId = 'memo1';
    const expectedMemo: SelectMemoInput = { id: 'memo1', userId: 'user1', content: 'Test Memo', createdAt: new Date(), updatedAt: new Date() };

    const whereMock = vi.fn().mockResolvedValueOnce([expectedMemo]);
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(mockDb.select).mockReturnValue({
      from: fromMock,
    } as unknown as ReturnType<typeof mockDb.select>);

    const result = await repository.getMemoById(memoId);

    expect(result).toEqual(expectedMemo);
    expect(mockDb.select).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith(schema.memos);
    expect(whereMock).toHaveBeenCalled();
  });

  it('should return null when memo is not found by id', async () => {
    const memoId = 'not-found';

    const whereMock = vi.fn().mockResolvedValueOnce([]);
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(mockDb.select).mockReturnValue({
      from: fromMock,
    } as unknown as ReturnType<typeof mockDb.select>);

    const result = await repository.getMemoById(memoId);

    expect(result).toBeNull();
    expect(mockDb.select).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith(schema.memos);
    expect(whereMock).toHaveBeenCalled();
  });

  it('should get memos by user id', async () => {
    const userId = 'user1';
    const expectedMemos: SelectMemoInput[] = [
      { id: 'memo1', userId: 'user1', content: 'Test Memo 1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'memo2', userId: 'user1', content: 'Test Memo 2', createdAt: new Date(), updatedAt: new Date() },
    ];

    const orderByMock = vi.fn().mockResolvedValueOnce(expectedMemos);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(mockDb.select).mockReturnValue({
      from: fromMock,
    } as unknown as ReturnType<typeof mockDb.select>);

    const result = await repository.getMemosByUserId(userId);

    expect(result).toEqual(expectedMemos);
    expect(mockDb.select).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith(schema.memos);
    expect(whereMock).toHaveBeenCalled();
    expect(orderByMock).toHaveBeenCalled();
  });
});
