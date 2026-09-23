import Link from 'next/link'
import { Card } from './Card'

type StatCardTone = 'neutral' | 'accent' | 'green' | 'amber' | 'red' | 'blue'

type StatCardProps = {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  hint?: string
  className?: string
  href?: string
  tone?: StatCardTone
}

const toneStyles: Record<StatCardTone, string> = {
  neutral: 'bg-gray-100 text-gray-600',
  accent: 'bg-accent-100 text-accent-600',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
}

export function StatCard({ label, value, icon, hint, className = '', href, tone = 'neutral' }: StatCardProps) {
  const content = (
    <Card
      className={`p-4 ${href ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500 leading-tight">{label}</p>
        {icon && (
          <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${toneStyles[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
