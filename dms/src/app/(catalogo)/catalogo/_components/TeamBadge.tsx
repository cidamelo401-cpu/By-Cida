'use client'

import { useState } from 'react'
import { TEAM_COLORS, getInitials } from './useTeamBadges'

export default function TeamBadge({
  team,
  badgeUrl,
  active,
  onClick,
  size = 'md',
}: {
  team: string
  badgeUrl?: string
  active?: boolean
  onClick?: () => void
  size?: 'md' | 'lg'
}) {
  const [imgError, setImgError] = useState(false)
  const colors = TEAM_COLORS[team] ?? { bg: '#333', text: '#fff' }

  const dims = size === 'lg' ? 'h-20 w-20' : 'h-16 w-16'
  const imgDims = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'

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
        style={!badgeUrl || imgError ? { backgroundColor: colors.bg } : { backgroundColor: '#151515' }}
      >
        {badgeUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badgeUrl}
            alt={team}
            className={`${imgDims} object-contain`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-extrabold" style={{ color: colors.text }}>
            {getInitials(team)}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] font-semibold max-w-[64px] truncate text-center transition-colors ${
          active ? 'text-[#C9A84C]' : 'text-gray-500 group-hover:text-gray-300'
        }`}
      >
        {team}
      </span>
    </Wrapper>
  )
}
