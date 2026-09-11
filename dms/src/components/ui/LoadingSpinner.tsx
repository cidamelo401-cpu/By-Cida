type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
  className?: string
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingSpinner({ size = 'md', label, fullScreen, className = '' }: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg className={`animate-spin text-primary-900 ${sizes[size]}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{content}</div>
  }

  return <div className="flex w-full items-center justify-center py-8">{content}</div>
}
