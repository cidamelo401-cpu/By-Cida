'use client'

import { useEffect, useMemo, useState, use as usePromise } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import type { Database } from '@/types/database'
import CatalogShell from '../../_components/CatalogShell'
import TeamBadge from '../../_components/TeamBadge'
import { useTeamBadges } from '../../_components/useTeamBadges'

type Product = Database['public']['Tables']['products']['Row']

type TeamInfo = {
  name: string
  shirtCount: number
  minPrice: number
  photo: string | null
}

export default function CollectionTeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = usePromise(params)
  const collectionName = slug === 'outros' ? 'Outros' : decodeURIComponent(slug)
  const COLLECTION_LABELS: Record<string, string> = { 'Copa': 'Seleções' }
  const collectionLabel = COLLECTION_LABELS[collectionName] ?? collectionName

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const supabase = createClient()
        let query = supabase
          .from('products')
          .select('*')
          .eq('archived', false)
          .in('status', ['disponivel', 'sob_encomenda'])
          .order('team')

        if (collectionName === 'Outros') {
          query = query.or('country_league.is.null,country_league.eq.')
        } else {
          query = query.eq('country_league', collectionName)
        }

        const { data, error: queryError } = await query

        if (queryError) {
          setError(queryError.message)
          return
        }
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
  }, [collectionName])

  const teamNames = useMemo(() => {
    const set = new Set(products.map((p) => p.team))
    return Array.from(set).sort()
  }, [products])

  const badges = useTeamBadges(teamNames)

  const teams = useMemo(() => {
    const map = new Map<string, TeamInfo>()
    for (const p of products) {
      const existing = map.get(p.team)
      if (existing) {
        existing.shirtCount++
        if (p.sell_price < existing.minPrice) existing.minPrice = p.sell_price
        if (!existing.photo && p.photo_url) existing.photo = p.photo_url
      } else {
        map.set(p.team, {
          name: p.team,
          shirtCount: 1,
          minPrice: p.sell_price,
          photo: p.photo_url,
        })
      }
    }
    const term = search.trim().toLowerCase()
    const result = Array.from(map.values())
    if (term) return result.filter((t) => t.name.toLowerCase().includes(term))
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [products, search])

  return (
    <CatalogShell>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <button onClick={() => { window.location.href = '/catalogo' }} className="hover:text-[#C9A84C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-gray-500">Catálogo</button>
          <span>/</span>
          <span className="text-gray-300">{collectionLabel}</span>
        </nav>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => { window.location.href = '/catalogo' }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors bg-transparent border-0 cursor-pointer p-0"
            aria-label="Voltar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
            {collectionLabel}
          </h1>
        </div>
      </div>

      {/* Search */}
      <section className="pb-4 pt-3">
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

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-4">
        {error ? (
          <div className="rounded-xl bg-red-950/40 border border-red-900 p-4 text-center">
            <p className="text-sm font-medium text-red-400">Erro ao carregar times</p>
            <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Carregando times...</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {teams.map((team) => (
                <div
                  key={team.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => { window.location.href = `/catalogo/colecao/${slug}/${encodeURIComponent(team.name)}` }}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/catalogo/colecao/${slug}/${encodeURIComponent(team.name)}` }}
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
          </>
        )}
      </main>
    </CatalogShell>
  )
}
