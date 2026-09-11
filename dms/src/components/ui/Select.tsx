'use client'
import { forwardRef, type SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  helper?: string
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, className = '', id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full appearance-none px-4 py-3 pr-10 rounded-xl border bg-white text-base
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200'}
              ${className}
            `.trim()}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
