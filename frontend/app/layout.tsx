"use client"
import './globals.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
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
  const { memos, setMemos } = useMemos()
  
  const [selectedMemos, setSelectedMemos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  const currentMemoId = params.id as string
  
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
      setSelectedMemos(new Set())
      router.push(`/memos/${memo.id}`)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedMemos.size > 0) {
      setMemos(memos.filter((memo) => !selectedMemos.has(memo.id!)))
      setSelectedMemos(new Set())
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
                disabled={selectedMemos.size === 0}
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
                        currentMemoId === memo.id && !selectedMemos.has(memo.id!) && "bg-blue-50 border-blue-200",
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
