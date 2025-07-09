"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, PenSquare, Eye, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

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

const renderMarkdown = (content: string) => {
  const html = content
    // エスケープ処理
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // コードブロック（\`\`\`で囲まれた部分）
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2"><code>$1</code></pre>',
    )

    // ヘッダー
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mb-1 mt-2 text-gray-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold mb-1 mt-3 text-gray-800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-2 mt-3 text-gray-900">$1</h1>')

    // 水平線
    .replace(/^---$/gm, '<hr class="border-gray-300 my-2">')

    // 引用
    .replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-gray-300 pl-4 py-1 mb-2 text-gray-600 italic">$1</blockquote>',
    )

    // チェックボックス付きリスト
    .replace(
      /^- \[x\] (.*$)/gim,
      '<div class="flex items-center mb-0.5"><input type="checkbox" checked disabled class="mr-2 text-xs"><span class="text-sm line-through text-gray-500">$1</span></div>',
    )
    .replace(
      /^- \[ \] (.*$)/gim,
      '<div class="flex items-center mb-0.5"><input type="checkbox" disabled class="mr-2 text-xs"><span class="text-sm">$1</span></div>',
    )

    // 番号付きリスト
    .replace(
      /^(\d+)\. (.*$)/gim,
      '<div class="flex mb-0.5"><span class="text-sm font-medium mr-2 text-gray-600">$1.</span><span class="text-sm">$2</span></div>',
    )

    // 通常のリスト
    .replace(
      /^- (.*$)/gim,
      '<div class="flex items-start mb-0.5"><span class="text-sm mr-2 text-gray-600">•</span><span class="text-sm">$1</span></div>',
    )

    // リンク
    .replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // 画像
    .replace(/!\[([^\]]*)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded mb-4">')

    // 太字
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // イタリック
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // インラインコード
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')

    // 改行処理
    .replace(/\n\n/g, '</p><p class="mb-1">')
    .replace(/\n/g, "<br>")

  // パラグラフで囲む（ただし、すでにHTMLタグで始まっている行は除く）
  const lines = html.split("\n")
  const processedLines = lines.map((line) => {
    const trimmedLine = line.trim()
    if (trimmedLine === "") return ""
    if (trimmedLine.match(/^<(h[1-6]|hr|blockquote|div|pre|ul|ol|li)/)) {
      return trimmedLine
    }
    if (trimmedLine.match(/^<\/(h[1-6]|hr|blockquote|div|pre|ul|ol|li)/)) {
      return trimmedLine
    }
    return `<p class="mb-1 leading-relaxed">${trimmedLine}</p>`
  })

  return processedLines.join("\n")
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
      title: "会議メモ",
      content:
        "## 定例会議\n\n### 議題\n- 進捗確認\n- 課題の共有\n\n### 決定事項\n**次回までに**完了予定のタスク：\n- デザインレビュー\n- テスト実装",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
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
    <div className="flex h-screen bg-white text-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search and Delete Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
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
        <div className="flex-1 overflow-y-auto">
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
          <div className="px-3 py-2 bg-blue-50 border-t border-blue-200">
            <div className="text-xs text-blue-600">Shiftキーを押しながらクリックで複数選択</div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
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
        <div className="flex-1 relative">
          {selectedMemo ? (
            <>
              {!isPreviewMode ? (
                <Textarea
                  ref={textareaRef}
                  value={selectedMemo.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="メモを入力してください..."
                  className="w-full h-full resize-none border-none shadow-none text-sm leading-relaxed p-4 focus-visible:ring-0"
                />
              ) : (
                <div
                  ref={previewRef}
                  className="w-full h-full overflow-y-auto p-4 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(selectedMemo.content),
                  }}
                />
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
