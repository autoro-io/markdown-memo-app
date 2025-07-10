import { CreateMemoInput, UpdateMemoInput, SelectMemoInput } from "../../db/types";

export interface MemoRepository {
  createMemo(data: CreateMemoInput): Promise<number>;
  updateMemo(memoId: number, data: UpdateMemoInput): Promise<void>;
  deleteMemo(memoId: number): Promise<void>;
  getMemoById(memoId: number): Promise<SelectMemoInput | null>;
  getMemosByUserId(userId: number): Promise<SelectMemoInput[] | null>;
}