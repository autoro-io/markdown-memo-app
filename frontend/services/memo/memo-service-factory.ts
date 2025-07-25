import { MemoService } from "@/services/memo/memo-service";
import { StubMemoService } from "@/services/memo/stub-memo-service";
import { ServerMemoService } from "@/services/memo/server-memo-service";

export class MemoServiceFactory {
  static create(): MemoService {
    // 環境変数やフラグに基づいてサービスを選択
    const useStub = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_STUB === 'true';
    
    if (useStub) {
      return new StubMemoService();
    } else {
      return new ServerMemoService();
    }
  }
}

// シングルトンインスタンス
export const memoService = MemoServiceFactory.create();
