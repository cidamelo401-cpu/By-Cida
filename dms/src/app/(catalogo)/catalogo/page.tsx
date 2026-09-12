'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import {
  MODEL_LABELS,
  SIZE_OPTIONS,
  VERSION_LABELS,
} from '@/lib/constants/products'
import type { Database, ProductSize, ProductVersion } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

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
  const [versionFilter, setVersionFilter] = useState<ProductVersion | ''>('')
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (term && !p.team.toLowerCase().includes(term)) return false
      if (sizeFilter && p.size !== sizeFilter) return false
      if (versionFilter && p.version !== versionFilter) return false
      if (teamFilter && p.team !== teamFilter) return false
      return true
    })
  }, [products, search, sizeFilter, versionFilter, teamFilter])

  const hasFilters = Boolean(sizeFilter || versionFilter || teamFilter)

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

          {/* Version chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip
              label="TODOS"
              active={versionFilter === ''}
              onClick={() => setVersionFilter('')}
            />
            {Object.entries(VERSION_LABELS).map(([value, label]) => (
              <Chip
                key={value}
                label={label.toUpperCase()}
                active={versionFilter === value}
                onClick={() => setVersionFilter(versionFilter === value ? '' : (value as ProductVersion))}
              />
            ))}
          </div>

          {/* Team chips */}
          {teams.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              <Chip
                small
                label="TODOS OS TIMES"
                active={teamFilter === ''}
                onClick={() => setTeamFilter('')}
              />
              {teams.map((team) => (
                <Chip
                  key={team}
                  small
                  label={team.toUpperCase()}
                  active={teamFilter === team}
                  onClick={() => setTeamFilter(teamFilter === team ? '' : team)}
                />
              ))}
            </div>
          )}

          {/* Size chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <Chip
              small
              label="TODOS OS TAMANHOS"
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
                setVersionFilter('')
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShirtPlaceholder />
            <p className="mt-4 font-semibold text-white">Nenhuma camisa encontrada</p>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((product) => (
                <CatalogCard key={product.id} product={product} />
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

function CatalogCard({ product }: { product: Product }) {
  return (
    <Link href={`/catalogo/${product.id}`}>
      <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/40 transition-colors h-full flex flex-col">
        <div className="relative aspect-square bg-gradient-to-b from-[#0F1F12] to-[#1A1A1A] flex items-center justify-center">
          {product.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo_url} alt={product.team} className="h-full w-full object-cover" />
          ) : (
            <ShirtPlaceholder />
          )}
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] font-bold uppercase tracking-wide text-[#C9A84C] border border-[#C9A84C]/30">
            {VERSION_LABELS[product.version]}
          </span>
          {product.quantity === 1 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 text-[9px] font-semibold">
              Última unidade!
            </span>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{product.team}</p>
          <p className="text-[11px] text-gray-500">
            {product.season ?? ''} · {MODEL_LABELS[product.model]} · {product.size}
          </p>
          <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{formatCurrency(product.sell_price)}</p>
          <span className="mt-1 w-full text-center rounded-lg bg-[#C9A84C] text-black text-xs font-bold uppercase py-2 tracking-wide">
            Comprar
          </span>
        </div>
      </div>
    </Link>
  )
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
