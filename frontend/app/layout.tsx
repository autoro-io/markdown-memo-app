"use client"
import './globals.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from 'next/navigation';
import { Memo } from '@/type/type'
import { useMemos } from '@/hooks/use-memos'

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
  const params = useParams()
  const { memos, setMemos, deleteMemo } = useMemos()
  
  const [selectedMemos, setSelectedMemos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  const currentMemoId = params.id as string
  
  // 現在表示中のメモを選択状態に含める
  const effectiveSelectedMemos = useMemo(() => {
    const selected = new Set(selectedMemos)
    if (currentMemoId) {
      selected.add(currentMemoId)
    }
    return selected
  }, [selectedMemos, currentMemoId])
  
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

    // Shiftキーが押されている場合は選択/選択解除
    if (isShiftPressed) {
      const newSelected = new Set(selectedMemos)
      if (newSelected.has(memo.id)) {
        newSelected.delete(memo.id)
      } else {
        newSelected.add(memo.id)
      }
      setSelectedMemos(newSelected)
      console.log('Selected memos:', Array.from(newSelected)) // デバッグ用
    } else {
      // 通常クリックの場合は詳細画面に遷移
      setSelectedMemos(new Set())
      router.push(`/memos/${memo.id}`)
    }
  }

  const handleDeleteSelected = async () => {
    if (effectiveSelectedMemos.size > 0) {
      try {
        // 選択されたメモを並行して削除
        const deletePromises = Array.from(effectiveSelectedMemos).map(memoId => deleteMemo(memoId));
        await Promise.all(deletePromises);
        
        // 選択状態をクリア
        setSelectedMemos(new Set());
        
        // 現在表示中のメモが削除された場合、トップページに戻る
        if (currentMemoId && effectiveSelectedMemos.has(currentMemoId)) {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to delete selected memos:', error);
        // エラーハンドリング - 必要に応じてユーザーに通知
      }
    }
  }

  const handleClearSelection = () => {
    setSelectedMemos(new Set());
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
              <div className="flex items-center gap-2">
                {effectiveSelectedMemos.size > 1 && (
                  <>
                    <span className="text-xs text-blue-600 font-medium">
                      {effectiveSelectedMemos.size}件選択
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                      className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      クリア
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={effectiveSelectedMemos.size === 0}
                  className={cn(
                    "h-7 w-7 p-0 hover:bg-gray-100",
                    effectiveSelectedMemos.size > 0 ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-gray-400"
                  )}
                  title={effectiveSelectedMemos.size > 0 ? `${effectiveSelectedMemos.size}件のメモを削除` : "削除するメモを選択してください"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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
                        "px-3 py-2 cursor-pointer border-b border-gray-100",
                        effectiveSelectedMemos.has(memo.id!) && "bg-blue-100 border-blue-300",
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
                <div className="text-xs text-blue-600">
                  Shiftキーを押しながらクリックで複数選択
                </div>
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
