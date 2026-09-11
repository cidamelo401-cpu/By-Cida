'use client'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

type AppLayoutProps = {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  action?: React.ReactNode
  userName?: string
  userRole?: string
  onSignOut?: () => void
}

export function AppLayout({ children, title, showBack, action, userName, userRole, onSignOut }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface lg:flex">
      <Sidebar userName={userName} userRole={userRole} onSignOut={onSignOut} />

      <div className="flex-1 min-w-0">
        {title && <TopBar title={title} showBack={showBack} action={action} />}

        <main className="px-4 py-4 pb-24 lg:px-8 lg:py-8 lg:pb-8 max-w-5xl mx-auto">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
