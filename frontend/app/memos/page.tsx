"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemos } from "@/hooks/use-memos"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MemosRedirectPage() {
  const { memos, loading, createMemo } = useMemos()
  const router = useRouter()

  useEffect(() => {
    if (!loading && memos.length > 0) {
      // memos are sorted by createdAt descending in the context
      const latestMemo = memos[0]
      if (latestMemo && latestMemo.id) {
        router.replace(`/memos/${latestMemo.id}`)
      }
    }
  }, [memos, loading, router])

  const handleCreateNewMemo = async () => {
    const newMemo = await createMemo({
      title: "新しいメモ",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    if (newMemo && newMemo.id) {
      router.push(`/memos/${newMemo.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <p>メモを読み込んでいます...</p>
      </div>
    )
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
        <p className="mb-4">まだメモがありません。</p>
        <Button onClick={handleCreateNewMemo}>
          <Plus className="w-4 h-4 mr-2" />
          新しいメモを作成
        </Button>
      </div>
    )
  }

  return null
}