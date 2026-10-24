'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  'Escócia': 'Scotland',
  'Espanha': 'Spain',
  'França': 'France',
  'Holanda': 'Netherlands',
  'Inglaterra': 'England',
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
  'Escócia': { bg: '#0065BD', text: '#fff' },
  'Espanha': { bg: '#AA151B', text: '#F1BF00' },
  'França': { bg: '#002395', text: '#fff' },
  'Holanda': { bg: '#FF6600', text: '#fff' },
  'Inglaterra': { bg: '#CF081F', text: '#fff' },
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

/* ── Termo de busca na Wikipédia (usada como reforço se a TheSportsDB falhar) ──
   Seleções levam "national football team" pra não cair na página do país;
   clubes com nome ambíguo (cidade, etc.) levam "football club" pra desempatar. */
const WIKI_SEARCH_NAMES: Record<string, string> = {
  'Alemanha': 'Germany national football team',
  'Argentina': 'Argentina national football team',
  'Bélgica': 'Belgium national football team',
  'Brasil': 'Brazil national football team',
  'Escócia': 'Scotland national football team',
  'Espanha': 'Spain national football team',
  'França': 'France national football team',
  'Holanda': 'Netherlands national football team',
  'Inglaterra': 'England national football team',
  'Itália': 'Italy national football team',
  'Japão': 'Japan national football team',
  'México': 'Mexico national football team',
  'Noruega': 'Norway national football team',
  'Portugal': 'Portugal national football team',
  'USA': 'United States men\'s national soccer team',
  'Barcelona': 'FC Barcelona',
  'Santos': 'Santos FC football club',
  'Palmeiras': 'Palmeiras football club',
  'Chelsea': 'Chelsea F.C.',
  'Arsenal': 'Arsenal F.C.',
}

async function fetchWikipediaBadge(team: string): Promise<string | undefined> {
  const query = WIKI_SEARCH_NAMES[team] ?? `${TEAM_SEARCH_NAMES[team] ?? team} football club`
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=1`
    )
    if (!searchRes.ok) return undefined
    const searchJson = await searchRes.json()
    const title = searchJson?.query?.search?.[0]?.title
    if (!title) return undefined

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
    if (!summaryRes.ok) return undefined
    const summaryJson = await summaryRes.json()
    return summaryJson?.thumbnail?.source ?? summaryJson?.originalimage?.source ?? undefined
  } catch {
    return undefined
  }
}

/* ── Hook to fetch team badges: 1) cadastro manual do Sérgio (Supabase) 2) busca automática (TheSportsDB) ── */
export function useTeamBadges(teams: string[]) {
  const [badges, setBadges] = useState<Record<string, string>>({})

  useEffect(() => {
    if (teams.length === 0) return
    let cancelled = false

    async function run() {
      // 1) Brasões cadastrados manualmente (Sérgio colou o link) têm prioridade máxima
      //    e nunca são sobrescritos pela busca automática — resolvidos antes de tudo.
      const supabase = createClient()
      const { data: manualRows } = await supabase.from('team_badges').select('team, badge_url').in('team', teams)
      if (cancelled) return
      const manualOverrides: Record<string, string> = {}
      for (const row of manualRows ?? []) {
        if (row.badge_url) manualOverrides[row.team] = row.badge_url
      }
      if (Object.keys(manualOverrides).length > 0) {
        setBadges((prev) => ({ ...prev, ...manualOverrides }))
      }

      // 2) Overrides locais fixos (casos especiais tratados no código)
      const localOverrides: Record<string, string> = {}
      for (const t of teams) {
        if (LOCAL_BADGES[t]) localOverrides[t] = LOCAL_BADGES[t]
      }
      if (Object.keys(localOverrides).length > 0) {
        setBadges((prev) => ({ ...prev, ...localOverrides }))
      }

      // 3) Busca automática só para os times que não têm brasão manual nem override local
      const teamsToFetch = teams.filter((t) => !manualOverrides[t] && !LOCAL_BADGES[t])
      if (teamsToFetch.length === 0) return

      const CACHE_KEY = 'dms_team_badges'
      const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, ts } = JSON.parse(cached)
          if (Date.now() - ts < CACHE_TTL && data && typeof data === 'object') {
            setBadges((prev) => ({ ...prev, ...data, ...localOverrides, ...manualOverrides }))
            const missing = teamsToFetch.filter((t) => !data[t])
            if (missing.length === 0) return
          }
        }
      } catch { /* ignore */ }

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
              if (res.ok) {
                const json = await res.json()
                const badge = json?.teams?.[0]?.strBadge
                if (badge) {
                  results[team] = badge
                  return
                }
              }
            } catch { /* ignore, tenta a Wikipédia a seguir */ }

            // Reforço: se a TheSportsDB falhar ou não achar nada, tenta a Wikipédia
            // (gratuita, sem chave, muito mais estável) antes de desistir.
            const wikiBadge = await fetchWikipediaBadge(team)
            if (wikiBadge) results[team] = wikiBadge
          })
        )

        if (i + 5 < teamsToFetch.length) {
          await new Promise((r) => setTimeout(r, 200))
        }
      }

      if (cancelled) return

      setBadges((prev) => {
        const merged = { ...prev, ...results, ...localOverrides, ...manualOverrides }
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: { ...results }, ts: Date.now() }))
        } catch { /* ignore */ }
        return merged
      })

      // Grava no banco os brasões encontrados pela primeira vez, pra não depender
      // mais da API externa (thesportsdb) nas próximas visitas — só o navegador que
      // buscou tinha esse cache antes, agora fica salvo pra todo mundo.
      const toPersist = Object.entries(results).filter(([team]) => !manualOverrides[team])
      if (toPersist.length > 0) {
        supabase
          .from('team_badges')
          .upsert(
            toPersist.map(([team, badge_url]) => ({ team, badge_url })),
            { onConflict: 'team', ignoreDuplicates: false }
          )
          .then(({ error }) => {
            if (error) console.error('Erro ao salvar brasão em cache:', error)
          })
      }
    }

    run()
    return () => { cancelled = true }
  }, [teams])

  return badges
}
