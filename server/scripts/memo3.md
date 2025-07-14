# Node.js + Express API設計

## RESTful API実装例

### Controller層の実装

```typescript
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { MemoService } from '../services/memo-service';

@injectable()
export class MemoController {
  constructor(
    @inject(TYPES.MemoService) private memoService: MemoService
  ) {}

  async getMemos(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const memos = await this.memoService.getMemosByUserId(
        userId,
        Number(page),
        Number(limit)
      );
      
      res.json({
        success: true,
        data: memos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: memos.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createMemo(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { content, title } = req.body;
      
      const memo = await this.memoService.createMemo({
        userId,
        content,
        title
      });
      
      res.status(201).json({
        success: true,
        data: memo
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Bad request'
      });
    }
  }
}
```

## エラーハンドリング

適切なHTTPステータスコードとエラーメッセージを返すことが重要です。

| ステータス | 用途 |
|-----------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー |
| 401 | 認証エラー |
| 404 | リソース未発見 |
| 500 | サーバーエラー |

### ミドルウェア例

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.details
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

---

**📚 参考資料**
- [Express.js公式ドキュメント](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)