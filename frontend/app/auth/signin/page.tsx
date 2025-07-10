"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account. A magic link will be sent to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center text-green-600">
              <p>Please check your email for the login link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
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
                {loading ? "Sending..." : "Sign In with Email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
