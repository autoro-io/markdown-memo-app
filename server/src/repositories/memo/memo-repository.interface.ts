import { CreateMemoInput, UpdateMemoInput, SelectMemoInput } from "../../db/types";

export interface MemoRepository {
  createMemo(data: CreateMemoInput): Promise<SelectMemoInput>;
  updateMemo(memoId: string, data: UpdateMemoInput): Promise<SelectMemoInput>;
  deleteMemo(memoId: string): Promise<void>;
  getMemoById(memoId: string): Promise<SelectMemoInput | null>;
  getMemosByUserId(userId: string): Promise<SelectMemoInput[] | null>;
}
