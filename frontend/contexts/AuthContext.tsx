import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { AuthService, User, auth } from "@/services";

type AuthContextType = {
  user: User | null
  loading: boolean
  accessToken: string | null
  signIn: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    // ログイン用コールバックURL
    if (pathname === "/auth/callback") {
      setLoading(true)
      const token = searchParams.get("token_hash")
      const tokenType = searchParams.get("type")
      if (token && tokenType === "email") {
        auth.verifyEmailAndToken(token)
      }
      return
    }

    // Initialize user and access token
    auth.getCurrentUser().then((user) => {
      if (!user) {
        setLoading(false)
        router.replace("/auth/signin")
        return
      }
      setUser(user)
      setAccessToken(auth.accessToken)
      const { unsubscribe } = auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setAccessToken(session?.access_token ?? null)
        setLoading(false)
      })

      return () => {
        unsubscribe()
      }
    }).catch((error) => {
      console.error("Error fetching current user:", error)
      setLoading(false)
      router.replace("/auth/signin")
      return null
    })

  }, [pathname, router])

  // signIn helper
  const signIn = async (email: string) => {
    const { error } = await auth.signIn(email)
    return { error }
  }

  const signOut = async () => {
    await auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}