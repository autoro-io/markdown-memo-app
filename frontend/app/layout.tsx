"use client"
import './globals.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useMemo } from 'react'
import { Search, Trash2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from 'next/navigation';
import { Memo } from '@/type/type'
import { useMemos } from '@/hooks/use-memos'
import { MemosProvider } from '@/contexts/MemosContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

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

function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const params = useParams()
  const { memos, setMemos, deleteMemo } = useMemos()
  const { signOut } = useAuth()
  
  const [selectedMemos, setSelectedMemos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  const currentMemoId = params.id as string
  
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

    if (isShiftPressed) {
      const newSelected = new Set(selectedMemos)
      if (newSelected.has(memo.id)) {
        newSelected.delete(memo.id)
      } else {
        newSelected.add(memo.id)
      }
      setSelectedMemos(newSelected)
      console.log('Selected memos:', Array.from(newSelected))
    } else {
      setSelectedMemos(new Set())
      router.push(`/memos/${memo.id}`)
    }
  }

  const handleDeleteSelected = async () => {
    if (effectiveSelectedMemos.size > 0) {
      try {
        const deletePromises = Array.from(effectiveSelectedMemos).map(memoId => deleteMemo(memoId));
        await Promise.all(deletePromises);
        
        setSelectedMemos(new Set());
        
        if (currentMemoId && effectiveSelectedMemos.has(currentMemoId)) {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to delete selected memos:', error);
      }
    }
  }

  const handleClearSelection = () => {
    setSelectedMemos(new Set());
  }

  const handleSignOut = async () => {
    await signOut()
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
        <div className={cn("flex-1 overflow-y-auto min-h-0", isShiftPressed && "select-none")}>
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

        {/* Sign Out Button */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full flex items-center justify-start text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            サインアウト
          </Button>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col h-full">
        { children }
      </div>
    </div>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MemosProvider>
            <AppContent>{children}</AppContent>
          </MemosProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
