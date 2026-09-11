type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

type BadgeProps = {
  children: React.ReactNode
  status?: BadgeStatus
  className?: string
}

const styles: Record<BadgeStatus, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-900',
}

export function Badge({ children, status = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]} ${className}`}
    >
      {children}
    </span>
  )
}
