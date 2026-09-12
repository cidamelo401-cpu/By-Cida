'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import type { Database } from '@/types/database'
import CatalogShell from './_components/CatalogShell'
import TeamBadge from './_components/TeamBadge'
import { useTeamBadges } from './_components/useTeamBadges'

type Product = Database['public']['Tables']['products']['Row']

type TeamInfo = {
  name: string
  shirtCount: number
  minPrice: number
  photo: string | null
  collections: Set<string>
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)

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
          setError(queryError.message)
          return
        }
        setProducts(data ?? [])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Build collection list for filter tabs
  const collections = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      const league = p.country_league?.trim()
      if (league) set.add(league)
    }
    return Array.from(set).sort()
  }, [products])

  // Get all unique team names for badge fetching
  const teamNames = useMemo(() => {
    const set = new Set(products.map((p) => p.team))
    return Array.from(set).sort()
  }, [products])

  const badges = useTeamBadges(teamNames)

  // Build teams, filtered by active collection and search
  const teams = useMemo(() => {
    const map = new Map<string, TeamInfo>()

    for (const p of products) {
      const league = p.country_league?.trim() || ''

      // Filter by collection if one is selected
      if (activeCollection && league !== activeCollection) continue

      const existing = map.get(p.team)
      if (existing) {
        existing.shirtCount++
        if (p.sell_price < existing.minPrice) existing.minPrice = p.sell_price
        if (!existing.photo && p.photo_url) existing.photo = p.photo_url
        if (league) existing.collections.add(league)
      } else {
        const cols = new Set<string>()
        if (league) cols.add(league)
        map.set(p.team, {
          name: p.team,
          shirtCount: 1,
          minPrice: p.sell_price,
          photo: p.photo_url,
          collections: cols,
        })
      }
    }

    const term = search.trim().toLowerCase()
    const result = Array.from(map.values())
    if (term) return result.filter((t) => t.name.toLowerCase().includes(term))
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [products, search, activeCollection])

  // Build the link for a team - if it belongs to exactly one collection, use the 3-level path
  function teamHref(team: TeamInfo) {
    if (activeCollection) {
      return `/catalogo/colecao/${encodeURIComponent(activeCollection)}/${encodeURIComponent(team.name)}`
    }
    if (team.collections.size === 1) {
      const col = Array.from(team.collections)[0]
      return `/catalogo/colecao/${encodeURIComponent(col)}/${encodeURIComponent(team.name)}`
    }
    // No collection or multiple — use "outros"
    return `/catalogo/colecao/outros/${encodeURIComponent(team.name)}`
  }

  return (
    <CatalogShell>
      {/* Search */}
      <section className="pb-4 pt-5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative">
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
              placeholder="Buscar time..."
              className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C9A84C] transition"
            />
          </div>
        </div>
      </section>

      {/* Collection filter tabs (only if there are real collections) */}
      {collections.length > 1 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCollection(null)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeCollection === null
                  ? 'bg-[#C9A84C] text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Todos
            </button>
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => setActiveCollection(activeCollection === col ? null : col)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeCollection === col
                    ? 'bg-[#C9A84C] text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-4">
        {error ? (
          <div className="rounded-xl bg-red-950/40 border border-red-900 p-4 text-center">
            <p className="text-sm font-medium text-red-400">Erro ao carregar catálogo</p>
            <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Carregando catálogo...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
            </svg>
            <p className="mt-4 font-semibold text-white">Nenhum time encontrado</p>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar a busca.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              {teams.length} {teams.length === 1 ? 'time' : 'times'}
              {activeCollection ? ` em ${activeCollection}` : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {teams.map((team) => (
                <Link key={team.name} href={teamHref(team)}>
                  <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/40 transition-colors h-full flex flex-col">
                    <div className="relative aspect-square bg-gradient-to-b from-[#0F1F12] to-[#1A1A1A] flex items-center justify-center">
                      {team.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.photo} alt={team.name} className="h-full w-full object-cover" />
                      ) : (
                        <TeamBadge
                          team={team.name}
                          badgeUrl={badges[team.name]}
                          size="lg"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="font-extrabold text-white text-sm uppercase leading-tight line-clamp-2">
                        {team.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {team.shirtCount} {team.shirtCount === 1 ? 'camisa' : 'camisas'}
                      </p>
                      <p className="text-xs text-[#C9A84C] font-bold mt-auto pt-1">
                        a partir de {formatCurrency(team.minPrice)}
                      </p>
                      <span className="mt-1 w-full text-center rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold uppercase py-2 tracking-wide">
                        Ver Camisas
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </CatalogShell>
  )
}
