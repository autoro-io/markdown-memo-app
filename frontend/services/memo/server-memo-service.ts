import { Memo } from "@/type/type";
import { appClient } from "@/lib/api-client";
import { MemoService } from "./memo-service";
import { SelectMemoInput } from "../../../server/src/db/types";

export class ServerMemoService extends MemoService {
  async getMemos(): Promise<Memo[]> {
    try {
      const response = await appClient.memos.$get();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SelectMemoInput[] = await response.json();

      // サーバーサイドのレスポンスをフロントエンドのMemo型に変換
      return data.map((memo) => ({
        id: memo.id,
        title: memo.content.substring(0, 50),
        content: memo.content,
        createdAt: memo.createdAt ? new Date(memo.createdAt) : undefined,
        updatedAt: memo.updatedAt ? new Date(memo.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch memos:', error);
      throw error;
    }
  }

  async updateMemo(id: string, updates: Partial<Memo>): Promise<Memo> {
    try {
      const response = await appClient.memos[':id'].$patch({
        param: { id },
        json: {
          content: updates.content,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SelectMemoInput = await response.json();
      
      // サーバーサイドのレスポンスをフロントエンドのMemo型に変換
      return {
        id: data.id,
        title: data.content.substring(0, 50),
        content: data.content,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Failed to update memo:', error);
      throw error;
    }
  }

  async createMemo(memo: Omit<Memo, 'id'>): Promise<Memo> {
    try {
      const response = await appClient.memos.$post({
        json: {
          content: memo.content,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SelectMemoInput = await response.json();
      
      // サーバーサイドのレスポンスをフロントエンドのMemo型に変換
      return {
        id: data.id,
        title: data.content.substring(0, 50),
        content: data.content,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Failed to create memo:', error);
      throw error;
    }
  }

  async deleteMemo(id: string): Promise<void> {
    try {
      const response = await appClient.memos[':id'].$delete({
        param: { id },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete memo:', error);
      throw error;
    }
  }
}
