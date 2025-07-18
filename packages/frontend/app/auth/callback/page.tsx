'use client'
import { useAuth } from "@/frontend/contexts/AuthContext"

export default function AuthCallback() {
  useAuth()

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">ログイン処理中...</h2>
      </div>
    </div>
  )
}