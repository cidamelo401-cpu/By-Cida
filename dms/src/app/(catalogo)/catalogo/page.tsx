'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import { MODEL_LABELS, CATALOG_SIZE_LABELS } from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'
import CatalogShell from './_components/CatalogShell'
import TeamBadge from './_components/TeamBadge'
import { useTeamBadges } from './_components/useTeamBadges'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

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
  status: Product['status']
  sizes: { size: ProductSize; quantity: number; id: string }[]
}

const SIZE_ORDER: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']
const KIDS_SIZES: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28']

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [kidsOnly, setKidsOnly] = useState(false)

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
          .in('status', ['disponivel', 'sob_encomenda'])
          .order('team')

        if (queryError) {
          setError(queryError.message)
          return
        }
        // sob_encomenda shows regardless of quantity; disponivel needs quantity > 0
        const filtered = (data ?? []).filter((p) => p.status === 'sob_encomenda' || p.quantity > 0)
        setProducts(filtered)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filtered products by active collection + kids toggle
  const filteredProducts = useMemo(() => {
    let result = products

    if (activeCollection) {
      if (activeCollection === '__outros__') {
        result = result.filter((p) => !p.country_league?.trim())
      } else {
        result = result.filter((p) => p.country_league?.trim() === activeCollection)
      }
    }

    if (kidsOnly) {
      result = result.filter((p) => KIDS_SIZES.includes(p.size))
    }

    return result
  }, [products, activeCollection, kidsOnly])

  // Check if there are any kids products
  const hasKidsProducts = useMemo(() => {
    return products.some((p) => KIDS_SIZES.includes(p.size))
  }, [products])

  // Collections (leagues) for filter tabs
  const collections = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      const league = p.country_league?.trim()
      if (league) {
        map.set(league, (map.get(league) ?? 0) + 1)
      }
    }
    const hasOthers = products.some((p) => !p.country_league?.trim())
    const result = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
    if (hasOthers) {
      const othersCount = products.filter((p) => !p.country_league?.trim()).length
      result.push({ name: '__outros__', count: othersCount })
    }
    return result
  }, [products])

  // Get all unique team names for badge fetching
  const teamNames = useMemo(() => {
    const set = new Set(filteredProducts.map((p) => p.team))
    return Array.from(set).sort()
  }, [filteredProducts])

  const badges = useTeamBadges(teamNames)

  // Build teams list (for "Todos" view and tabs)
  const teams = useMemo(() => {
    const map = new Map<string, TeamInfo>()

    for (const p of filteredProducts) {
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
  }, [filteredProducts, search])

  // Build grouped shirts for the selected team
  const groupedShirts = useMemo(() => {
    if (!activeTeam) return []

    const teamProducts = filteredProducts.filter((p) => p.team === activeTeam)
    const map = new Map<string, GroupedShirt>()

    for (const p of teamProducts) {
      const key = `${p.team}|${p.model}`

      const existing = map.get(key)
      if (existing) {
        const existingSize = existing.sizes.find((s) => s.size === p.size)
        if (existingSize) {
          existingSize.quantity += p.quantity
        } else {
          existing.sizes.push({ size: p.size, quantity: p.quantity, id: p.id })
        }
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
          status: p.status,
          sizes: [{ size: p.size, quantity: p.quantity, id: p.id }],
        })
      }
    }

    for (const g of map.values()) {
      g.sizes.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
    }

    return Array.from(map.values())
  }, [filteredProducts, activeTeam])

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

  function handleCollectionTab(col: string | null) {
    setActiveCollection(col)
    setActiveTeam(null)
    setSearch('')
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
              onChange={(e) => { setSearch(e.target.value); setActiveTeam(null); setActiveCollection(null); setKidsOnly(false) }}
              placeholder="Buscar time..."
              className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C9A84C] transition"
            />
          </div>
        </div>
      </section>

      {/* Filter tabs: collections + kids */}
      {!loading && (collections.length > 0 || hasKidsProducts) && (
        <section className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Collection tabs — "Todas as Coleções" first */}
            {collections.length > 0 && (
              <>
                <button
                  onClick={() => handleCollectionTab(null)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                    activeCollection === null
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Todas as Coleções
                </button>
                {collections.map((col) => {
                  const COLLECTION_LABELS: Record<string, string> = { '__outros__': 'Outros', 'Copa': 'Seleções' }
                  const colLabel = COLLECTION_LABELS[col.name] ?? col.name
                  return (
                    <button
                      key={col.name}
                      onClick={() => handleCollectionTab(col.name)}
                      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                        activeCollection === col.name
                          ? 'bg-[#C9A84C] text-black'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {colLabel}
                    </button>
                  )
                })}
              </>
            )}

            {/* Kids toggle — after collections */}
            {hasKidsProducts && (
              <button
                onClick={() => { setKidsOnly(!kidsOnly); setActiveTeam(null) }}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5 ${
                  kidsOnly
                    ? 'bg-[#C9A84C] text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                👶 Kids
              </button>
            )}
          </div>
        </section>
      )}

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
              Todos
            </button>
            {teamNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleTeamTab(name)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                    activeTeam === name
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {name}
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
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {groupedShirts.map((shirt) => {
                  const isSobEncomenda = shirt.status === 'sob_encomenda'
                  const href = isSobEncomenda ? '/catalogo/sob-encomenda' : `/catalogo/${shirt.sizes[0]?.id}`
                  return (
                  <div
                    key={shirt.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => { window.location.href = href }}
                    onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = href }}
                    className="cursor-pointer"
                  >
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
                              {CATALOG_SIZE_LABELS[s.size] ?? s.size}
                            </span>
                          ))}
                        </div>
                        <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{formatCurrency(shirt.sell_price)}</p>
                        {isSobEncomenda ? (
                          <span className="mt-1 w-full text-center rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold uppercase py-2 tracking-wide">
                            Sob Encomenda
                          </span>
                        ) : (
                          <span className="mt-1 w-full text-center rounded-lg bg-[#C9A84C] text-black text-xs font-bold uppercase py-2 tracking-wide">
                            Comprar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {teams.map((team) => (
                  <div
                    key={team.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => { window.location.href = teamHref(team) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = teamHref(team) }}
                    className="cursor-pointer"
                  >
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
                        <p className="text-xs text-[#C9A84C] font-bold mt-auto pt-1">
                          {formatCurrency(team.minPrice)}
                        </p>
                        <span className="mt-1 w-full text-center rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold uppercase py-2 tracking-wide">
                          Ver Camisas
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Não encontrou? Fale conosco */}
              <div className="mt-8">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const msg = 'Olá! Não encontrei a camisa que procuro no catálogo. Vocês conseguem me ajudar?'
                    window.location.assign(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const msg = 'Olá! Não encontrei a camisa que procuro no catálogo. Vocês conseguem me ajudar?'
                      window.location.assign(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`)
                    }
                  }}
                  className="cursor-pointer"
                >
                  <div className="bg-[#1A1A1A] rounded-2xl border border-dashed border-[#C9A84C]/40 p-5 flex items-center gap-4 hover:border-[#25D366] transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 flex-shrink-0">
                      <svg className="h-6 w-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">Não encontrou o que procura?</p>
                      <p className="text-xs text-gray-400 mt-0.5">Manda uma mensagem que a gente te ajuda! 💬</p>
                    </div>
                    <svg className="h-5 w-5 text-[#25D366] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </main>
    </CatalogShell>
  )
}
