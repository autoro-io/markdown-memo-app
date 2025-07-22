import { Memo } from "@/frontend/type/type";

export const memos: Memo[] = [
  {
    id: "1",
    title: "プロジェクトのアイデア",
    content:
      "# 新しいプロジェクト\n\n## 概要\n- Markdownエディタの作成\n- **重要**: ユーザビリティを重視\n- *シンプル*なデザイン\n\n## 機能\n1. リアルタイムプレビュー\n2. 検索機能\n3. 複数選択\n\n`コードブロック`のサポートも必要。",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "TypeScriptサンプルコード",
    content:
      "# TypeScript コードサンプル\n\n## インターフェース定義\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  isActive: boolean;\n}\n\ninterface ApiResponse<T> {\n  data: T;\n  success: boolean;\n  message?: string;\n}\n```\n\n## 関数の例\n\n```typescript\n// ユーザー情報を取得する関数\nasync function fetchUser(userId: number): Promise<ApiResponse<User>> {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    const data = await response.json();\n    \n    return {\n      data,\n      success: true\n    };\n  } catch (error) {\n    return {\n      data: null as any,\n      success: false,\n      message: error instanceof Error ? error.message : '不明なエラー'\n    };\n  }\n}\n\n// 配列操作の例\nconst users: User[] = [\n  { id: 1, name: 'Alice', email: 'alice@example.com', isActive: true },\n  { id: 2, name: 'Bob', email: 'bob@example.com', isActive: false }\n];\n\nconst activeUsers = users.filter(user => user.isActive);\n```\n\n## React コンポーネント\n\n```typescript\nimport React, { useState, useEffect } from 'react';\n\ninterface Props {\n  userId: number;\n}\n\nconst UserProfile: React.FC<Props> = ({ userId }) => {\n  const [user, setUser] = useState<User | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const loadUser = async () => {\n      setLoading(true);\n      const result = await fetchUser(userId);\n      \n      if (result.success) {\n        setUser(result.data);\n      }\n      setLoading(false);\n    };\n\n    loadUser();\n  }, [userId]);\n\n  if (loading) return <div>読み込み中...</div>;\n  if (!user) return <div>ユーザーが見つかりません</div>;\n\n  return (\n    <div className=\"user-profile\">\n      <h2>{user.name}</h2>\n      <p>Email: {user.email}</p>\n      <p>Status: {user.isActive ? 'アクティブ' : '非アクティブ'}</p>\n    </div>\n  );\n};\n\nexport default UserProfile;\n```",
    createdAt: new Date(Date.now() - 43200000),
    updatedAt: new Date(Date.now() - 43200000),
  },
  {
    id: "3",
    title: "会議メモ",
    content:
      "## 定例会議\n\n### 議題\n- 進捗確認\n- 課題の共有\n\n### 決定事項\n**次回までに**完了予定のタスク：\n- デザインレビュー\n- テスト実装",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    title: "タスクリスト",
    content: "# TODO\n\n- [x] 要件定義\n- [ ] UI設計\n- [ ] 実装\n- [ ] テスト\n\n*優先度高*のタスクから進める。",
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
];
