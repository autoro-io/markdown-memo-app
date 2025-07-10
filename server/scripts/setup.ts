import { container } from "../src/inversify.config";
import { TYPES } from "../src/types";
import { db } from "../src/db/libsql";
import * as schema from "../src/db/schema";
import { MemoService } from "../src/services/memo-service";
import { migrate } from "drizzle-orm/libsql/migrator";

// create database
await migrate(db, {
  migrationsFolder: "./db",
})

// Seed Data

// Insert User
await db.insert(schema.users).values({
  id: "user1",
  name: "Test User",
});
await db.insert(schema.users).values({
  id: "user2",
  name: "Another User",
});

// Insert Memos
const memoService = container.get<MemoService>(TYPES.MemoService);
await memoService.createMemo({
  userId: "user1",
  content: `# TypeScript開発のベストプラクティス

## 型定義の重要性

TypeScriptを使用する際は、適切な型定義を行うことが重要です。

### インターface定義の例

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
}

interface CreateUserRequest {
  name: string;
  email?: string;
}
\`\`\`

### ジェネリクスの活用

\`\`\`typescript
function createRepository<T extends { id: string }>(
  entities: T[]
): Repository<T> {
  return {
    findById: (id: string) => entities.find(e => e.id === id),
    getAll: () => [...entities],
    create: (entity: Omit<T, 'id'>) => {
      const newEntity = { ...entity, id: crypto.randomUUID() } as T;
      entities.push(newEntity);
      return newEntity;
    }
  };
}
\`\`\`

## 重要なポイント

- **型安全性**: コンパイル時にエラーを検出
- **IDE支援**: 優れた補完とリファクタリング
- **保守性**: コードの意図が明確になる

> 💡 **Tip**: \`strict\`モードを有効にして、より厳密な型チェックを行いましょう。`,
});
await memoService.createMemo({
  userId: "user1",
  content: `# React + TypeScript パターン集

## Custom Hooks の実装

\`\`\`typescript
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
\`\`\`

## コンポーネント設計

### Propsの型定義

\`\`\`typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size} \${className}\`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
\`\`\`

## チェックリスト

- [ ] Props型を適切に定義
- [ ] Generic型を活用
- [ ] エラーハンドリングを実装
- [ ] パフォーマンス最適化`,
});
await memoService.createMemo({
  userId: "user2",
  content: `# Node.js + Express API設計

## RESTful API実装例

### Controller層の実装

\`\`\`typescript
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
\`\`\`

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

\`\`\`typescript
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
\`\`\`

---

**📚 参考資料**
- [Express.js公式ドキュメント](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)`,
});