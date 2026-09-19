'use client'

/**
 * Simplified badge utility for the pajama catalog.
 * The original fetched collection badges.
 * For pajamas there are no external badge APIs, so this just
 * provides initials as fallback identifiers for product names.
 */

export function getInitials(name: string): string {
  const words = name.split(/\s+/)
  if (words.length === 1) return name.slice(0, 3).toUpperCase()
  return words.map((w) => w[0]).join('').toUpperCase().slice(0, 3)
}

/**
 * Hook kept for API compatibility — returns an empty record
 * since pajama products don't have external badge images.
 */
export function useTeamBadges(_names: string[]): Record<string, string> {
  return {}
}
