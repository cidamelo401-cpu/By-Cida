'use client'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  helper?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-base resize-none
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200'}
            ${className}
          `.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
