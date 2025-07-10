import { Memo } from "@/type/type";

export abstract class MemoService {
  abstract getMemos(): Promise<Memo[]>;
  abstract updateMemo(id: string, updates: Partial<Memo>): Promise<Memo>;
  abstract createMemo(memo: Omit<Memo, 'id'>): Promise<Memo>;
  abstract deleteMemo(id: string): Promise<void>;
}
