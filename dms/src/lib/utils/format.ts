/**
 * Formatting utilities in pt-BR (Brazilian Portuguese) locale.
 */

/** Format a number as Brazilian currency: "R$ 1.234,56" */
export function formatCurrency(value: number): string {
  try {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
    if (formatted) return formatted
  } catch {
    // fall through to manual formatting below
  }

  // Manual fallback in case Intl.NumberFormat misbehaves (seen on some iOS/WebKit versions)
  const n = Number.isFinite(value) ? value : 0
  const negative = n < 0
  const rounded = Math.round(Math.abs(n) * 100) / 100
  const [intPart, decPart = '00'] = rounded.toFixed(2).split('.')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${negative ? '-' : ''}R$ ${withThousands},${decPart}`
}

/** Format a phone number string as "(11) 99999-9999" or "(11) 9999-9999" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

/** Format a date as "11/09/2026" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

/** Format a date and time as "11/09/2026 14:30" */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const datePart = new Intl.DateTimeFormat('pt-BR').format(d)
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  return `${datePart} ${timePart}`
}

/** Parse a Brazilian formatted currency string ("1.234,56" or "R$ 1.234,56") into a number */
export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=.*\.)/g, '') // remove thousands separators, keep last "."
    .replace(/\.(?=\d{3}(?:\D|$))/g, '') // remove "." used as thousands separator
    .replace(',', '.')

  const parsed = parseFloat(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Generate a SKU from team, season, model, version and size */
export function generateSKU(team: string, season: string, model: string, version: string, size: string): string {
  const slug = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  return [slug(team), slug(season), slug(model), slug(version), slug(size)].filter(Boolean).join('-')
}

/** Build a WhatsApp deep link with a pre-filled message for a given phone number */
export function getWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`
  return `https://api.whatsapp.com/send?phone=${withCountryCode}&text=${encodeURIComponent(message)}`
}

/** Export an array of flat objects to a downloadable CSV file (pt-BR friendly, semicolon-separated) */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (typeof document === 'undefined' || data.length === 0) return

  const headers = Object.keys(data[0])

  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = typeof value === 'number' ? String(value).replace('.', ',') : String(value)
    if (/[";\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = data.map((row) => headers.map((h) => escapeCell(row[h])).join(';'))
  const csvContent = [headers.join(';'), ...rows].join('\r\n')

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
