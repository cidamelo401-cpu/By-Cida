'use client'

import { getInitials } from './useTeamBadges'

/**
 * ProductBadge — shows product collection initials as a simple badge.
 * Repurposed from the original TeamBadge (football crests) to a generic
 * collection/product-name badge for the pajama catalog.
 */
export default function TeamBadge({
  label,
  badgeUrl,
  active,
  onClick,
  size = 'md',
}: {
  label: string
  badgeUrl?: string
  active?: boolean
  onClick?: () => void
  size?: 'md' | 'lg'
}) {
  const dims = size === 'lg' ? 'h-20 w-20' : 'h-16 w-16'

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      className="flex flex-col items-center gap-2 shrink-0 group"
    >
      <div
        className={`${dims} rounded-full flex items-center justify-center overflow-hidden transition-all border-2 ${
          active
            ? 'border-[#C9A84C] scale-110 shadow-[0_0_16px_rgba(201,168,76,0.5)]'
            : 'border-white/10 group-hover:border-white/30'
        }`}
        style={{ backgroundColor: '#2A2040' }}
      >
        <span className="text-xs font-extrabold text-[#C9A84C]">
          {getInitials(label)}
        </span>
      </div>
      <span
        className={`text-[10px] font-semibold max-w-[64px] truncate text-center transition-colors ${
          active ? 'text-[#C9A84C]' : 'text-gray-500 group-hover:text-gray-300'
        }`}
      >
        {label}
      </span>
    </Wrapper>
  )
}
