'use client'
import { forwardRef, type InputHTMLAttributes } from 'react'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, className = '', placeholder = 'Buscar...', ...props }, ref) => {
    const showClear = Boolean(value) && onClear

    return (
      <div className="relative w-full">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          className={`
            w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-base
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${className}
          `.trim()}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'
