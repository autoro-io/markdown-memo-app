'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      setEmail('admin@example.com')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitted(false)

    const result = await signIn(email)

    if (result && result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインするには、以下にメールアドレスを入力してください。マジックリンクが送信されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-green-600">ログイン用のリンクを記載したメールを確認してください。</p>
              {process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' && (
                <Link href="/memos" className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  メモ一覧へ
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '送信中...' : 'メールでサインイン'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


