'use client'

import { useEffect, useState } from 'react'

/* ── TheSportsDB search names for each team ── */
export const TEAM_SEARCH_NAMES: Record<string, string> = {
  'Al-Hilal': 'Al-Hilal',
  'Alemanha': 'Germany',
  'Arsenal': 'Arsenal',
  'Barcelona': 'Barcelona',
  'Bayern': 'Bayern Munich',
  'Benfica': 'Benfica',
  'Boca Juniors': 'Boca Juniors',
  'Borussia Dortmund': 'Borussia Dortmund',
  'Brasil': 'Brazil',
  'Bélgica': 'Belgium',
  'Chelsea': 'Chelsea',
  'Corinthians': 'Corinthians',
  'Espanha': 'Spain',
  'França': 'France',
  'Inter Miami': 'Inter Miami',
  'Itália': 'Italy',
  'Japão': 'Japan',
  'Juventus': 'Juventus',
  'Liverpool': 'Liverpool',
  'Manchester City': 'Manchester City',
  'Manchester United': 'Manchester United',
  'México': 'Mexico',
  'Napoli': 'Napoli',
  'Noruega': 'Norway',
  'PSV': 'PSV',
  'Palmeiras': 'Palmeiras',
  'Portugal': 'Portugal',
  'Santos': 'Santos',
  'Real Madrid': 'Real Madrid',
  'São Paulo': 'Sao Paulo',
  'USA': 'USA',
  'Valência': 'Valencia CF',
  'Vasco': 'Vasco da Gama',
}

/* ── Fallback colors when badge image fails ── */
export const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
  'Al-Hilal': { bg: '#1A3F8F', text: '#fff' },
  'Arsenal': { bg: '#EF0107', text: '#fff' },
  'Barcelona': { bg: '#A50044', text: '#EDBB00' },
  'Bayern': { bg: '#DC052D', text: '#fff' },
  'Benfica': { bg: '#E2001A', text: '#fff' },
  'Boca Juniors': { bg: '#002D6A', text: '#FFD700' },
  'Borussia Dortmund': { bg: '#FDE100', text: '#000' },
  'Chelsea': { bg: '#034694', text: '#fff' },
  'Corinthians': { bg: '#000', text: '#fff' },
  'Inter Miami': { bg: '#F7B5CD', text: '#231F20' },
  'Juventus': { bg: '#000', text: '#fff' },
  'Liverpool': { bg: '#C8102E', text: '#fff' },
  'Manchester City': { bg: '#6CABDD', text: '#1C2C5B' },
  'Manchester United': { bg: '#DA291C', text: '#fff' },
  'Napoli': { bg: '#12A0D7', text: '#fff' },
  'Palmeiras': { bg: '#006437', text: '#fff' },
  'PSV': { bg: '#ED1C24', text: '#fff' },
  'Real Madrid': { bg: '#FEBE10', text: '#00529F' },
  'Santos': { bg: '#fff', text: '#000' },
  'São Paulo': { bg: '#FF0000', text: '#fff' },
  'Vasco': { bg: '#000', text: '#fff' },
  'Brasil': { bg: '#FFDF00', text: '#009739' },
  'Alemanha': { bg: '#000', text: '#fff' },
  'Bélgica': { bg: '#ED2939', text: '#FFD700' },
  'Espanha': { bg: '#AA151B', text: '#F1BF00' },
  'França': { bg: '#002395', text: '#fff' },
  'Itália': { bg: '#0066B3', text: '#fff' },
  'Japão': { bg: '#002868', text: '#fff' },
  'México': { bg: '#006847', text: '#fff' },
  'Noruega': { bg: '#EF2B2D', text: '#002868' },
  'Portugal': { bg: '#006600', text: '#FF0000' },
  'USA': { bg: '#002868', text: '#BF0A30' },
  'Valência': { bg: '#FF4500', text: '#000' },
}

export function getInitials(team: string): string {
  const map: Record<string, string> = {
    'Al-Hilal': 'AH', 'Borussia Dortmund': 'BVB', 'Boca Juniors': 'BOC',
    'Inter Miami': 'MIA', 'Manchester City': 'MCI', 'Manchester United': 'MUN',
    'Real Madrid': 'RMA', 'São Paulo': 'SPF',
  }
  if (map[team]) return map[team]
  const words = team.split(/\s+/)
  if (words.length === 1) return team.slice(0, 3).toUpperCase()
  return words.map((w) => w[0]).join('').toUpperCase().slice(0, 3)
}

/* ── Local badge overrides (bypass API) ── */
const LOCAL_BADGES: Record<string, string> = {
  'Al-Hilal': '/badges/al-hilal.png',
}

/* ── Hook to fetch team badges from TheSportsDB ── */
export function useTeamBadges(teams: string[]) {
  const [badges, setBadges] = useState<Record<string, string>>({})

  useEffect(() => {
    if (teams.length === 0) return

    // Apply local overrides immediately
    const localOverrides: Record<string, string> = {}
    for (const t of teams) {
      if (LOCAL_BADGES[t]) localOverrides[t] = LOCAL_BADGES[t]
    }
    if (Object.keys(localOverrides).length > 0) {
      setBadges((prev) => ({ ...prev, ...localOverrides }))
    }

    // Only fetch from API for teams without local overrides
    const teamsToFetch = teams.filter((t) => !LOCAL_BADGES[t])
    if (teamsToFetch.length === 0) return

    const CACHE_KEY = 'dms_team_badges'
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL && data && typeof data === 'object') {
          setBadges({ ...data, ...localOverrides })
          const missing = teamsToFetch.filter((t) => !data[t])
          if (missing.length === 0) return
        }
      }
    } catch { /* ignore */ }

    let cancelled = false

    async function fetchBadges() {
      const results: Record<string, string> = {}

      for (let i = 0; i < teamsToFetch.length; i += 5) {
        if (cancelled) break
        const batch = teamsToFetch.slice(i, i + 5)

        await Promise.all(
          batch.map(async (team) => {
            const searchName = TEAM_SEARCH_NAMES[team] ?? team
            try {
              const res = await fetch(
                `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchName)}`
              )
              if (!res.ok) return
              const json = await res.json()
              const badge = json?.teams?.[0]?.strBadge
              if (badge) {
                results[team] = badge
              }
            } catch { /* ignore failed fetches */ }
          })
        )

        if (i + 5 < teamsToFetch.length) {
          await new Promise((r) => setTimeout(r, 200))
        }
      }

      if (cancelled) return

      setBadges((prev) => {
        const merged = { ...prev, ...results, ...localOverrides }
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: merged, ts: Date.now() }))
        } catch { /* ignore */ }
        return merged
      })
    }

    fetchBadges()
    return () => { cancelled = true }
  }, [teams])

  return badges
}
