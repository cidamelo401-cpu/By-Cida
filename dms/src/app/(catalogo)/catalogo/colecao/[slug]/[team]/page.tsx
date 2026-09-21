'use client'

import { useEffect, useMemo, useState, use as usePromise } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import { MODEL_LABELS, CATALOG_SIZE_LABELS } from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'
import CatalogShell from '../../../_components/CatalogShell'
import TeamBadge from '../../../_components/TeamBadge'
import { useTeamBadges } from '../../../_components/useTeamBadges'

type Product = Database['public']['Tables']['products']['Row']

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
  sizes: { size: Product['size']; quantity: number; id: string }[]
}

const SIZE_ORDER: ProductSize[] = ['AD', 'T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']
const KIDS_SIZES: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28']

export default function TeamShirtsPage({ params }: { params: Promise<{ slug: string; team: string }> }) {
  const { slug, team: teamSlug } = usePromise(params)
  const collectionName = slug === 'outros' ? 'Outros' : decodeURIComponent(slug)
  const COLLECTION_LABELS: Record<string, string> = { 'Copa': 'Seleções' }
  const collectionLabel = COLLECTION_LABELS[collectionName] ?? collectionName
  const teamName = decodeURIComponent(teamSlug)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const badges = useTeamBadges([teamName])

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
          .eq('team', teamName)
          .order('model')

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
  }, [collectionName, teamName])

  const grouped = useMemo(() => {
    const map = new Map<string, GroupedShirt>()

    for (const p of products) {
      const isKids = KIDS_SIZES.includes(p.size)
      const key = (p as any).catalog_group ?? `${p.team}|${p.model}|${p.season ?? ''}|${isKids ? 'kids' : 'adult'}`

      const existing = map.get(key)
      if (existing) {
        const existingSize = existing.sizes.find((s) => s.size === p.size)
        if (existingSize) {
          existingSize.quantity += p.quantity
        } else {
          existing.sizes.push({ size: p.size, quantity: p.quantity, id: p.id })
        }
        if ((p as any).is_cover && p.photo_url) {
          existing.photo_url = p.photo_url
        } else if (!existing.photo_url && p.photo_url) {
          existing.photo_url = p.photo_url
        }
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
  }, [products])

  return (
    <CatalogShell>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <button onClick={() => { window.location.href = '/catalogo' }} className="hover:text-[#C9A84C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-gray-500">Catálogo</button>
          <span>/</span>
          <button onClick={() => { window.location.href = `/catalogo/colecao/${slug}` }} className="hover:text-[#C9A84C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-gray-500">
            {collectionLabel}
          </button>
          <span>/</span>
          <span className="text-gray-300">{teamName}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = `/catalogo/colecao/${slug}` }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors bg-transparent border-0 cursor-pointer p-0"
            aria-label="Voltar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <TeamBadge team={teamName} badgeUrl={badges[teamName]} size="lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
              {teamName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{collectionLabel}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-4">
        {error ? (
          <div className="rounded-xl bg-red-950/40 border border-red-900 p-4 text-center">
            <p className="text-sm font-medium text-red-400">Erro ao carregar camisas</p>
            <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Carregando camisas...</span>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
            </svg>
            <p className="mt-4 font-semibold text-white">Nenhuma camisa encontrada</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {grouped.map((shirt) => {
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

                      {/* Available sizes */}
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

                      <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{shirt.status === 'sob_encomenda' && shirt.sell_price <= 0 ? 'Sob consulta' : formatCurrency(shirt.sell_price)}</p>
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
        )}
      </main>
    </CatalogShell>
  )
}
