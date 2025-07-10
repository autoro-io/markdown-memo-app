import { Memo } from "@/type/type";
import { memos as stubMemos } from "@/lib/data";
import { MemoService } from "./memo-service";

export class StubMemoService extends MemoService {
  private memos: Memo[] = [...stubMemos];

  async getMemos(): Promise<Memo[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.memos];
  }

  async updateMemo(id: string, updates: Partial<Memo>): Promise<Memo> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const memoIndex = this.memos.findIndex(memo => memo.id === id);
    if (memoIndex === -1) {
      throw new Error(`Memo with id ${id} not found`);
    }
    
    this.memos[memoIndex] = { ...this.memos[memoIndex], ...updates };
    return this.memos[memoIndex];
  }

  async createMemo(memo: Omit<Memo, 'id'>): Promise<Memo> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newMemo: Memo = {
      ...memo,
      id: Date.now().toString(), // Simple ID generation
    };
    
    this.memos.push(newMemo);
    return newMemo;
  }

  async deleteMemo(id: string): Promise<void> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const memoIndex = this.memos.findIndex(memo => memo.id === id);
    if (memoIndex === -1) {
      throw new Error(`Memo with id ${id} not found`);
    }
    
    this.memos.splice(memoIndex, 1);
  }
}
