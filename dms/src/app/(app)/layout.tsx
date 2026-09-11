'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/ui'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout userName={profile?.full_name ?? user.email ?? undefined} userRole={profile?.role} onSignOut={signOut}>
      {children}
    </AppLayout>
  )
}
