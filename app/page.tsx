"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, PenSquare, Eye, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Memo {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

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
    const dateKey = formatDate(memo.createdAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(memo)
  })

  return groups
}

export default function MarkdownMemoApp() {
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
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const groupedMemos = groupMemosByDate(filteredMemos)

  const handleMemoSelect = (memo: Memo) => {
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
    }
  }

  const handleDeleteSelected = () => {
    if (selectedMemos.size > 0) {
      setMemos(memos.filter((memo) => !selectedMemos.has(memo.id)))
      setSelectedMemos(new Set())
      if (selectedMemo && selectedMemos.has(selectedMemo.id)) {
        setSelectedMemo(memos.find((memo) => !selectedMemos.has(memo.id)) || null)
      }
    } else if (selectedMemo) {
      setMemos(memos.filter((memo) => memo.id !== selectedMemo.id))
      const remainingMemos = memos.filter((memo) => memo.id !== selectedMemo.id)
      setSelectedMemo(remainingMemos.length > 0 ? remainingMemos[0] : null)
    }
  }

  const handleNewMemo = () => {
    const newMemo: Memo = {
      id: Date.now().toString(),
      title: "新しいメモ",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setMemos([newMemo, ...memos])
    setSelectedMemo(newMemo)
    setSelectedMemos(new Set())
  }

  const handleContentChange = (content: string) => {
    if (selectedMemo) {
      const updatedMemo = {
        ...selectedMemo,
        content,
        title: content.split("\n")[0].replace(/^#+ /, "") || "新しいメモ",
        updatedAt: new Date(),
      }
      setSelectedMemo(updatedMemo)
      setMemos(memos.map((memo) => (memo.id === selectedMemo.id ? updatedMemo : memo)))
    }
  }

  const handleModeToggle = () => {
    // 現在のスクロール位置を保存
    if (isPreviewMode && previewRef.current) {
      scrollPositionRef.current = previewRef.current.scrollTop
    } else if (!isPreviewMode && textareaRef.current) {
      scrollPositionRef.current = textareaRef.current.scrollTop
    }

    setIsPreviewMode(!isPreviewMode)

    // モード切り替え後にスクロール位置を復元
    setTimeout(() => {
      if (isPreviewMode && textareaRef.current) {
        textareaRef.current.scrollTop = scrollPositionRef.current
      } else if (!isPreviewMode && previewRef.current) {
        previewRef.current.scrollTop = scrollPositionRef.current
      }
    }, 0)
  }

  return (
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
                    selectedMemo?.id === memo.id && !selectedMemos.has(memo.id) && "bg-blue-50 border-blue-200",
                    selectedMemos.has(memo.id) && "bg-blue-100 border-blue-300",
                  )}
                >
                  <div className="text-xs font-bold text-gray-900 mb-1 truncate">{memo.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {memo.content.replace(/[#*`]/g, "").substring(0, 60)}...
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {memo.updatedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
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
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleNewMemo} className="h-7 w-7 p-0 hover:bg-gray-100">
            <PenSquare className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModeToggle}
              className={cn("h-7 px-2 text-xs hover:bg-gray-100", !isPreviewMode && "bg-gray-100")}
            >
              <Edit3 className="w-3 h-3 mr-1" />
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModeToggle}
              className={cn("h-7 px-2 text-xs hover:bg-gray-100", isPreviewMode && "bg-gray-100")}
            >
              <Eye className="w-3 h-3 mr-1" />
              プレビュー
            </Button>
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 relative min-h-0">
          {selectedMemo ? (
            <>
              {!isPreviewMode ? (
                <Textarea
                  ref={textareaRef}
                  value={selectedMemo.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="メモを入力してください..."
                  className="w-full h-full resize-none border-none shadow-none text-sm leading-relaxed p-4 focus-visible:ring-0 overflow-y-auto"
                />
              ) : (
                <div
                  ref={previewRef}
                  className="w-full h-full overflow-y-auto p-4 text-sm leading-relaxed"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-1 mt-3 text-gray-800">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-gray-800">{children}</h3>,
                      p: ({ children }) => <p className="mb-1 leading-relaxed text-sm">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 pl-6 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-6 list-decimal">{children}</ol>,
                      li: ({ children, ...props }) => {
                        // チェックボックスリストアイテムの場合
                        if (props.className?.includes('task-list-item')) {
                          return <li className="mb-0.5 text-sm list-none flex items-center" {...props}>{children}</li>;
                        }
                        return <li className="mb-0.5 text-sm" {...props}>{children}</li>;
                      },
                      input: ({ type, checked, ...props }) => {
                        if (type === 'checkbox') {
                          return <input type="checkbox" checked={checked} disabled className="mr-2 text-xs" {...props} />;
                        }
                        return <input type={type} {...props} />;
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 mb-2 text-gray-600 italic text-sm">
                          {children}
                        </blockquote>
                      ),
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                            <SyntaxHighlighter
                              style={tomorrow as any}
                              language={match[1]}
                              PreTag="div"
                              className="!bg-transparent !text-xs !leading-5 !font-mono overflow-x-auto"
                              customStyle={{
                                background: 'transparent',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                padding: '0',
                                margin: '0'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300" {...props}>
                            {children}
                          </code>
                        )
                      },
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          className="text-blue-600 hover:text-blue-800 underline text-sm" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt} className="max-w-full h-auto rounded mb-4" />
                      ),
                      hr: () => <hr className="border-gray-300 my-2" />,
                    }}
                  >
                    {selectedMemo.content}
                  </ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">メモを選択してください</div>
          )}
        </div>
      </div>
    </div>
  )
}
