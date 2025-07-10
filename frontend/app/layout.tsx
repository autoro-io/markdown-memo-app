"use client"
import './globals.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation';
import { Memo } from '@/type/type'

const formatDate = (date: Date) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "今日"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "昨日"
  } else {
    return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
  }
}

const groupMemosByDate = (memos: Memo[]) => {
  const groups: { [key: string]: Memo[] } = {}

  memos.forEach((memo) => {
    const dateKey = formatDate(memo.createdAt ? new Date(memo.createdAt) : new Date())
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(memo)
  })

  return groups
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [memos, setMemos] = useState<Memo[]>([
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
  ])

  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(memos[0])
  const [selectedMemos, setSelectedMemos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const filteredMemos = memos
    .filter(
      (memo) =>
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {    
      if (!a.createdAt || !b.createdAt) return 0
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const groupedMemos = groupMemosByDate(filteredMemos)

  const handleMemoSelect = (memo: Memo) => {
    if (!memo.id) return;

    if (isShiftPressed) {
      const newSelected = new Set(selectedMemos)
      if (newSelected.has(memo.id)) {
        newSelected.delete(memo.id)
      } else {
        newSelected.add(memo.id)
      }
      setSelectedMemos(newSelected)
    } else {
      setSelectedMemo(memo)
      setSelectedMemos(new Set())
      router.push(`/memos/${memo.id}`)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedMemos.size > 0) {
      setMemos(memos.filter((memo) => !selectedMemos.has(memo.id!)))
      setSelectedMemos(new Set())      
      if (selectedMemo && selectedMemos.has(selectedMemo.id!)) {
        setSelectedMemo(memos.find((memo) => !selectedMemos.has(memo.id!)) || null)
      }
    } else if (selectedMemo) {
      setMemos(memos.filter((memo) => memo.id !== selectedMemo.id))
      const remainingMemos = memos.filter((memo) => memo.id !== selectedMemo.id)
      setSelectedMemo(remainingMemos.length > 0 ? remainingMemos[0] : null)
    }
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col h-full">
            {/* Search and Delete Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center flex-1 mr-2">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none shadow-none text-xs h-7 px-0 focus-visible:ring-0"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedMemos.size === 0 && !selectedMemo}
                className="h-7 w-7 p-0 hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Memo List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {Object.entries(groupedMemos).map(([date, memos]) => (
                <div key={date}>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">{date}</div>
                  {memos.map((memo) => (
                    <div
                      key={memo.id}
                      onClick={() => handleMemoSelect(memo)}
                      className={cn(
                        "px-3 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-50",
                        selectedMemo?.id === memo.id && !selectedMemos.has(memo.id!) && "bg-blue-50 border-blue-200",
                        selectedMemos.has(memo.id!) && "bg-blue-100 border-blue-300",
                      )}
                    >
                      <div className="text-xs font-bold text-gray-900 mb-1 truncate">{memo.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {memo.content.replace(/[#*`]/g, "").substring(0, 60)}...
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {memo.updatedAt?.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Shift Selection Hint */}
            {isShiftPressed && (
              <div className="px-3 py-2 bg-blue-50 border-t border-blue-200 flex-shrink-0">
                <div className="text-xs text-blue-600">Shiftキーを押しながらクリックで複数選択</div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col h-full">
            { children }
          </div>
        </div>      </body>
    </html>
  )
}
