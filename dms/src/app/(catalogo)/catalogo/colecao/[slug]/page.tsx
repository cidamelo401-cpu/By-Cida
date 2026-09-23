'use client'

import { useEffect, useMemo, useState, use as usePromise } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getWhatsAppLink } from '@/lib/utils/format'
import { MODEL_LABELS, CATALOG_SIZE_LABELS } from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'
import CatalogShell from '../../_components/CatalogShell'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

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
  sizes: { size: ProductSize; quantity: number; id: string }[]
}

const SIZE_ORDER: ProductSize[] = ['AD', 'T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']
const KIDS_SIZES: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28']

export default function CollectionShirtsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = usePromise(params)
  const collectionName = slug === 'outros' ? 'Outros' : slug === 'sob-encomenda' ? 'Sob encomenda' : decodeURIComponent(slug)
  const COLLECTION_LABELS: Record<string, string> = { 'Copa': 'Seleções', 'Sob encomenda': 'Sob Encomenda' }
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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((p) => p.team.toLowerCase().includes(term))
  }, [products, search])

  const shirts = useMemo(() => {
    const map = new Map<string, GroupedShirt>()

    for (const p of filteredProducts) {
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

    return Array.from(map.values()).sort((a, b) => a.team.localeCompare(b.team))
  }, [filteredProducts])

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
        ) : shirts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
            </svg>
            <p className="mt-4 font-semibold text-white">Nenhuma camisa encontrada</p>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar a busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {shirts.map((shirt) => {
              const isSobEncomenda = shirt.status === 'sob_encomenda'
              const href = `/catalogo/${shirt.sizes[0]?.id}`
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
                      {!isSobEncomenda && (
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
                      )}
                      <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{isSobEncomenda && shirt.sell_price <= 0 ? 'Sob consulta' : formatCurrency(shirt.sell_price)}</p>
                      {isSobEncomenda ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const productUrl = `${window.location.origin}${href}`
                            const msg = `Olá! Tenho interesse na camisa ${shirt.team} (sob encomenda). Pode me passar mais informações?\n\n${productUrl}`
                            window.location.assign(getWhatsAppLink(WHATSAPP_NUMBER, msg))
                          }}
                          className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold uppercase py-2 tracking-wide bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors cursor-pointer border-0"
                        >
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Chamar no WhatsApp
                        </button>
                      ) : (
                        <span className="mt-1 w-full text-center rounded-lg text-xs font-bold uppercase py-2 tracking-wide bg-[#C9A84C] text-black">
                          Comprar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </CatalogShell>
  )
}
