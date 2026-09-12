'use client'

import { type InputHTMLAttributes } from 'react'

type CurrencyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  label?: string
  error?: string
  helper?: string
  /** Value in the same unit as stored (e.g. 80 = R$ 80,00) */
  value: number
  /** Called with the new numeric value */
  onValueChange: (value: number) => void
}

/**
 * Brazilian-style currency input that formats as you type.
 * Digits are entered from right to left: typing "8000" shows "R$ 80,00".
 */
export function CurrencyInput({ label, error, helper, value, onValueChange, className = '', id, disabled, ...props }: CurrencyInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  // Format a number to display string "R$ 1.234,56"
  function toDisplay(v: number): string {
    if (v === 0) return ''
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  // Convert cents integer to a real number: 8000 → 80.00
  function centsToValue(cents: number): number {
    return cents / 100
  }

  // Convert value to cents integer: 80.00 → 8000
  function valueToCents(v: number): number {
    return Math.round(v * 100)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Extract only digits
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits, 10) || 0
    onValueChange(centsToValue(cents))
  }

  const displayValue = toDisplay(value)
  // For cursor: keep raw cents for controlled input
  const centsStr = value === 0 ? '' : String(valueToCents(value))

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-base
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200'}
            ${disabled ? 'bg-gray-50 text-gray-400' : ''}
            ${className}
          `.trim()}
          value={displayValue}
          onChange={handleChange}
          placeholder="R$ 0,00"
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
    </div>
  )
}
