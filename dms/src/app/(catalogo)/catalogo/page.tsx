'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import { MODEL_LABELS } from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'
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

type GroupedShirt = {
  key: string
  team: string
  model: Product['model']
  season: string | null
  notes: string | null
  photo_url: string | null
  version: Product['version']
  sell_price: number
  sizes: { size: ProductSize; quantity: number; id: string }[]
}

const SIZE_ORDER: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [activeTeam, setActiveTeam] = useState<string | null>(null)

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

  // Get all unique team names for badge fetching
  const teamNames = useMemo(() => {
    const set = new Set(products.map((p) => p.team))
    return Array.from(set).sort()
  }, [products])

  const badges = useTeamBadges(teamNames)

  // Build teams list (for "Todos" view and tabs)
  const teams = useMemo(() => {
    const map = new Map<string, TeamInfo>()

    for (const p of products) {
      const league = p.country_league?.trim() || ''
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
  }, [products, search])

  // Build grouped shirts for the selected team
  const groupedShirts = useMemo(() => {
    if (!activeTeam) return []

    const teamProducts = products.filter((p) => p.team === activeTeam)
    const map = new Map<string, GroupedShirt>()

    for (const p of teamProducts) {
      const colorNote = p.notes?.match(/Cor[:\s]*(\w+)/i)?.[1]?.toLowerCase() ?? ''
      const key = `${p.team}|${p.model}|${colorNote}|${p.season ?? ''}`

      const existing = map.get(key)
      if (existing) {
        existing.sizes.push({ size: p.size, quantity: p.quantity, id: p.id })
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

    for (const g of map.values()) {
      g.sizes.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
    }

    return Array.from(map.values())
  }, [products, activeTeam])

  // Build the link for a team card
  function teamHref(team: TeamInfo) {
    if (team.collections.size === 1) {
      const col = Array.from(team.collections)[0]
      return `/catalogo/colecao/${encodeURIComponent(col)}/${encodeURIComponent(team.name)}`
    }
    return `/catalogo/colecao/outros/${encodeURIComponent(team.name)}`
  }

  function handleTeamTab(teamName: string) {
    setActiveTeam(activeTeam === teamName ? null : teamName)
    setSearch('')
  }

  const totalShirts = products.length

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
              onChange={(e) => { setSearch(e.target.value); setActiveTeam(null) }}
              placeholder="Buscar time..."
              className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C9A84C] transition"
            />
          </div>
        </div>
      </section>

      {/* Quick badge bar — horizontal scroll with team crests */}
      {!loading && teamNames.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {teamNames.map((name) => (
              <button
                key={name}
                onClick={() => handleTeamTab(name)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16 group"
              >
                <div className={`w-14 h-14 rounded-full bg-[#1A1A1A] border-2 transition-colors flex items-center justify-center overflow-hidden ${
                  activeTeam === name
                    ? 'border-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                    : 'border-white/10 group-hover:border-[#C9A84C]'
                }`}>
                  {badges[name] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={badges[name]}
                      alt={name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <TeamBadge team={name} badgeUrl={undefined} size="md" />
                  )}
                </div>
                <span className={`text-[10px] text-center leading-tight line-clamp-2 transition-colors ${
                  activeTeam === name ? 'text-[#C9A84C] font-bold' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Team filter tabs */}
      {!loading && teamNames.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => { setActiveTeam(null); setSearch('') }}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTeam === null
                  ? 'bg-[#C9A84C] text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Todos ({totalShirts})
            </button>
            {teamNames.map((name) => {
              const count = products.filter((p) => p.team === name).length
              return (
                <button
                  key={name}
                  onClick={() => handleTeamTab(name)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                    activeTeam === name
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {name} ({count})
                </button>
              )
            })}
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
        ) : activeTeam ? (
          /* ===== TEAM VIEW: show grouped shirts ===== */
          groupedShirts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="mt-4 font-semibold text-white">Nenhuma camisa encontrada</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                {badges[activeTeam] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={badges[activeTeam]} alt={activeTeam} className="w-10 h-10 object-contain" />
                )}
                <div>
                  <h2 className="text-lg font-extrabold uppercase text-white">{activeTeam}</h2>
                  <p className="text-xs text-gray-500">
                    {groupedShirts.length} {groupedShirts.length === 1 ? 'modelo' : 'modelos'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {groupedShirts.map((shirt) => (
                  <Link key={shirt.key} href={`/catalogo/${shirt.sizes[0]?.id}`}>
                    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/40 transition-colors h-full flex flex-col">
                      <div className="relative aspect-square bg-gradient-to-b from-[#0F1F12] to-[#1A1A1A] flex items-center justify-center">
                        {shirt.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={shirt.photo_url} alt={shirt.team} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
                          </svg>
                        )}
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{shirt.team}</p>
                        <p className="text-[11px] text-gray-500">
                          {shirt.season ?? ''} · {MODEL_LABELS[shirt.model]}
                        </p>
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
                ))}
              </div>
            </>
          )
        ) : (
          /* ===== ALL TEAMS VIEW ===== */
          teams.length === 0 ? (
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
                {teams.length} {teams.length === 1 ? 'time' : 'times'} · {totalShirts} {totalShirts === 1 ? 'camisa' : 'camisas'}
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
          )
        )}
      </main>
    </CatalogShell>
  )
}
