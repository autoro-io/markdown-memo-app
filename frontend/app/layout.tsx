"use client"
import './globals.css'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && pathname === '/') {
      if (user) {
        router.push('/memos')
      } else {
        router.push('/auth/signin')
      }
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return <div>Loading...</div> // Or a more sophisticated loading spinner
  }

  return <>{children}</>
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
          <AuthRedirect>{children}</AuthRedirect>
        </AuthProvider>
      </body>
    </html>
  )
}