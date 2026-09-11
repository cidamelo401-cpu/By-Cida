import { Card } from './Card'

type StatCardProps = {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  hint?: string
  className?: string
}

export function StatCard({ label, value, icon, hint, className = '' }: StatCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon && <div className="text-primary-700">{icon}</div>}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </Card>
  )
}
