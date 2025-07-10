"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemos } from "@/hooks/use-memos"

export default function MemosRedirectPage() {
  const { memos, loading } = useMemos()
  const router = useRouter()

  useEffect(() => {
    if (!loading && memos.length > 0) {
      // memos are sorted by createdAt descending in the context
      const latestMemo = memos[0]
      if (latestMemo && latestMemo.id) {
        router.replace(`/memos/${latestMemo.id}`)
      }
    } else if (!loading && memos.length === 0) {
      // Handle case with no memos, maybe show a message or create one
      // For now, just indicating loading
    }
  }, [memos, loading, router])

  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      <p>メモを読み込んでいます...</p>
    </div>
  )
}
