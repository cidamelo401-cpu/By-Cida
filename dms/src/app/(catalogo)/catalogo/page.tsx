'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import {
  MODEL_LABELS,
  SIZE_OPTIONS,
} from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

/* ── TheSportsDB search names for each team ── */
const TEAM_SEARCH_NAMES: Record<string, string> = {
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
const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
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

function getInitials(team: string): string {
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

/* ── Hook to fetch team badges from TheSportsDB ── */
function useTeamBadges(teams: string[]) {
  const [badges, setBadges] = useState<Record<string, string>>({})

  useEffect(() => {
    if (teams.length === 0) return

    // Try to load from localStorage cache first
    const CACHE_KEY = 'dms_team_badges'
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL && data && typeof data === 'object') {
          setBadges(data)
          // Still fetch missing teams
          const missing = teams.filter((t) => !data[t])
          if (missing.length === 0) return
        }
      }
    } catch { /* ignore */ }

    // Fetch badges from TheSportsDB
    let cancelled = false

    async function fetchBadges() {
      const results: Record<string, string> = {}

      // Fetch in batches of 5 to avoid overwhelming the API
      for (let i = 0; i < teams.length; i += 5) {
        if (cancelled) break
        const batch = teams.slice(i, i + 5)

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

        // Small delay between batches
        if (i + 5 < teams.length) {
          await new Promise((r) => setTimeout(r, 200))
        }
      }

      if (cancelled) return

      setBadges((prev) => {
        const merged = { ...prev, ...results }
        // Cache to localStorage
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

function ShirtPlaceholder() {
  return (
    <svg className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState<ProductSize | ''>('')
  const [teamFilter, setTeamFilter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const supabase = createClient()
        const { data, error: queryError } = await supabase
          .from('products')
          .select('*')
          .eq('archived', false)
          .eq('status', 'disponivel')
          .gt('quantity', 0)
          .order('team')

        if (queryError) {
          console.error('Supabase error:', queryError)
          setError(queryError.message)
          return
        }
        setProducts(data ?? [])
      } catch (err) {
        console.error('Fetch error:', err)
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const teams = useMemo(() => {
    const set = new Set(products.map((p) => p.team))
    return Array.from(set).sort()
  }, [products])

  const badges = useTeamBadges(teams)

  /* ── Group products by shirt (team + model + color/notes) ── */
  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase()
    const map = new Map<string, GroupedShirt>()

    for (const p of products) {
      if (term && !p.team.toLowerCase().includes(term)) continue
      if (teamFilter && p.team !== teamFilter) continue
      if (sizeFilter && p.size !== sizeFilter) continue

      // Group key: same shirt = same team + model + season + color (from notes)
      const colorNote = p.notes?.match(/Cor:\s*(\w+)/i)?.[1] ?? ''
      const key = `${p.team}|${p.model}|${p.season ?? ''}|${colorNote}`

      const existing = map.get(key)
      if (existing) {
        existing.sizes.push({ size: p.size, quantity: p.quantity, id: p.id })
        // Use photo if this variant has one and existing doesn't
        if (!existing.photo_url && p.photo_url) existing.photo_url = p.photo_url
      } else {
        map.set(key, {
          key,
          team: p.team,
          model: p.model,
          season: p.season,
          notes: p.notes,
          photo_url: p.photo_url,
          version: p.version,
          sell_price: p.sell_price,
          sizes: [{ size: p.size, quantity: p.quantity, id: p.id }],
        })
      }
    }

    // Sort sizes in each group
    const sizeOrder = ['T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']
    for (const g of map.values()) {
      g.sizes.sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
    }

    return Array.from(map.values()).sort((a, b) => a.team.localeCompare(b.team))
  }, [products, search, sizeFilter, teamFilter])

  const hasFilters = Boolean(sizeFilter || teamFilter)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/catalogo" className="flex items-center gap-2.5">
            <Image
              src="/logo-dms-sports.jpg"
              alt="DMS Sports"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-white">
                DMS <span className="text-[#C9A84C]">Sports</span>
              </p>
              <p className="text-[10px] text-gray-500">Camisas de Futebol</p>
            </div>
          </Link>
          <a
            href="https://www.instagram.com/dmssports.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C9A84C] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="hidden sm:inline">@dmssports.oficial</span>
          </a>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="pb-6 pt-5">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            Camisas de <span className="text-[#C9A84C]">Futebol</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Encontre a camisa do seu time e compre pelo WhatsApp
          </p>

          {/* Search */}
          <div className="mt-4 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por time..."
              className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C9A84C] transition"
            />
          </div>

          {/* Team badges carousel — real escudos */}
          {teams.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
                Filtre por time
              </p>
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {/* "Todos" button */}
                <button
                  onClick={() => setTeamFilter('')}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-all border-2 bg-[#1A1A1A] ${
                      teamFilter === ''
                        ? 'border-[#C9A84C] scale-110 shadow-[0_0_16px_rgba(201,168,76,0.5)]'
                        : 'border-white/10 group-hover:border-white/30'
                    }`}
                  >
                    ⚽
                  </div>
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      teamFilter === '' ? 'text-[#C9A84C]' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  >
                    Todos
                  </span>
                </button>

                {teams.map((team) => (
                  <TeamBadge
                    key={team}
                    team={team}
                    badgeUrl={badges[team]}
                    active={teamFilter === team}
                    onClick={() => setTeamFilter(teamFilter === team ? '' : team)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <Chip
              small
              label="TODOS"
              active={sizeFilter === ''}
              onClick={() => setSizeFilter('')}
            />
            {SIZE_OPTIONS.map((size) => (
              <Chip
                key={size}
                small
                label={size}
                active={sizeFilter === size}
                onClick={() => setSizeFilter(sizeFilter === size ? '' : size)}
              />
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSizeFilter('')
                setTeamFilter('')
              }}
              className="mt-3 text-xs font-medium text-gray-500 hover:text-[#C9A84C] transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-4">
        {error ? (
          <div className="rounded-xl bg-red-950/40 border border-red-900 p-4 text-center">
            <p className="text-sm font-medium text-red-400">Erro ao carregar catálogo</p>
            <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
            {error.includes('MISSING') && (
              <p className="mt-2 text-xs text-red-400">
                Verifique as variáveis de ambiente na Vercel: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Carregando catálogo...</span>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShirtPlaceholder />
            <p className="mt-4 font-semibold text-white">Nenhuma camisa encontrada</p>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              {grouped.length} {grouped.length === 1 ? 'camisa' : 'camisas'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {grouped.map((shirt) => (
                <CatalogCard key={shirt.key} shirt={shirt} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 text-gray-500 py-8 mt-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-dms-sports.jpg"
              alt="DMS Sports"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-sm">
              DMS <span className="text-[#C9A84C]">Sports</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#C9A84C] transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/dmssports.oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#C9A84C] transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi! Vi o catálogo da DMS Sports e gostaria de saber mais!')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5a] transition-colors"
        aria-label="Falar no WhatsApp"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}

/* ── Team Badge with real crest image ── */
function TeamBadge({
  team,
  badgeUrl,
  active,
  onClick,
}: {
  team: string
  badgeUrl?: string
  active: boolean
  onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const colors = TEAM_COLORS[team] ?? { bg: '#333', text: '#fff' }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 shrink-0 group"
    >
      <div
        className={`h-16 w-16 rounded-full flex items-center justify-center overflow-hidden transition-all border-2 ${
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
            className="h-11 w-11 object-contain"
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
    </button>
  )
}

function CatalogCard({ shirt }: { shirt: GroupedShirt }) {
  // Link to first product's detail page
  const firstId = shirt.sizes[0]?.id

  return (
    <Link href={`/catalogo/${firstId}`}>
      <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/40 transition-colors h-full flex flex-col">
        <div className="relative aspect-square bg-gradient-to-b from-[#0F1F12] to-[#1A1A1A] flex items-center justify-center">
          {shirt.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shirt.photo_url} alt={shirt.team} className="h-full w-full object-cover" />
          ) : (
            <ShirtPlaceholder />
          )}
        </div>
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{shirt.team}</p>
          <p className="text-[11px] text-gray-500">
            {shirt.season ?? ''} · {MODEL_LABELS[shirt.model]}
          </p>

          {/* Available sizes */}
          <div className="flex flex-wrap gap-1 mt-1">
            {shirt.sizes.map((s) => (
              <span
                key={s.size}
                className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-semibold text-gray-300"
              >
                {s.size}
              </span>
            ))}
          </div>

          <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{formatCurrency(shirt.sell_price)}</p>
          <span className="mt-1 w-full text-center rounded-lg bg-[#C9A84C] text-black text-xs font-bold uppercase py-2 tracking-wide">
            Comprar
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Reuse the GroupedShirt type at module level ── */
type GroupedShirt = {
  key: string
  team: string
  model: Product['model']
  season: string | null
  notes: string | null
  photo_url: string | null
  version: Product['version']
  sell_price: number
  sizes: { size: Product['size']; quantity: number; id: string }[]
}

function Chip({
  label,
  active,
  onClick,
  small,
}: {
  label: string
  active: boolean
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full transition-colors ${
        small ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-sm'
      } ${
        active
          ? 'bg-[#C9A84C] text-black font-bold'
          : 'border border-gray-600 text-gray-400 hover:border-[#C9A84C] font-medium'
      }`}
    >
      {label}
    </button>
  )
}
