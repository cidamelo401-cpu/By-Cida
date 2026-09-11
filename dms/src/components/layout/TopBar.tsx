'use client'
import { useRouter } from 'next/navigation'

type TopBarProps = {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export function TopBar({ title, showBack, action }: TopBarProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-100 bg-white/90 backdrop-blur px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
