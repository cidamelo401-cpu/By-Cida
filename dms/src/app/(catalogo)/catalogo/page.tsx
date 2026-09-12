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
import type { Database, ProductModel, ProductSize, ProductVersion } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

function ShirtPlaceholder() {
  return (
    <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function CatalogoPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [sizeFilter, setSizeFilter] = useState<ProductSize | ''>('')
  const [modelFilter, setModelFilter] = useState<ProductModel | ''>('')
  const [versionFilter, setVersionFilter] = useState<ProductVersion | ''>('')

  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
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
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const teams = useMemo(() => {
    const set = new Set(products.map((p) => p.team))
    return Array.from(set).sort()
  }, [products])

  const [teamFilter, setTeamFilter] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (term && !p.team.toLowerCase().includes(term)) return false
      if (sizeFilter && p.size !== sizeFilter) return false
      if (modelFilter && p.model !== modelFilter) return false
      if (versionFilter && p.version !== versionFilter) return false
      if (teamFilter && p.team !== teamFilter) return false
      return true
    })
  }, [products, search, sizeFilter, modelFilter, versionFilter, teamFilter])

  const hasFilters = Boolean(sizeFilter || modelFilter || versionFilter || teamFilter)

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#141414] text-white shadow-lg">
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
              <p className="text-sm font-bold leading-tight">
                DMS <span className="text-[#C9A84C]">Sports</span>
              </p>
              <p className="text-[10px] text-gray-400">Camisas de Futebol</p>
            </div>
          </Link>
          <a
            href="https://www.instagram.com/dmssports.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#C9A84C] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="hidden sm:inline">@dmssports.oficial</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#141414] text-white pb-8 pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Camisas de <span className="text-[#C9A84C]">Futebol</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Encontre a camisa do seu time e compre pelo WhatsApp
          </p>

          {/* Search */}
          <div className="mt-4 relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
              className="w-full rounded-xl bg-white/10 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#C9A84C]/50 focus:ring-2 focus:ring-[#C9A84C]/20 transition"
            />
          </div>
        </div>
      </section>

      {/* Filters + Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-5">
          <FilterChip
            label="Time"
            value={teamFilter}
            options={teams.map((t) => ({ value: t, label: t }))}
            onChange={setTeamFilter}
          />
          <FilterChip
            label="Tamanho"
            value={sizeFilter}
            options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
            onChange={(v) => setSizeFilter(v as ProductSize | '')}
          />
          <FilterChip
            label="Modelo"
            value={modelFilter}
            options={Object.entries(MODEL_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={(v) => setModelFilter(v as ProductModel | '')}
          />
          <FilterChip
            label="Versão"
            value={versionFilter}
            options={Object.entries(VERSION_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={(v) => setVersionFilter(v as ProductVersion | '')}
          />
          {hasFilters && (
            <button
              onClick={() => {
                setSizeFilter('')
                setModelFilter('')
                setVersionFilter('')
                setTeamFilter('')
              }}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-[#141414]"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-sm font-medium text-red-800">Erro ao carregar catálogo</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
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
            <p className="mt-4 font-semibold text-gray-900">Nenhuma camisa encontrada</p>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} {filtered.length === 1 ? 'camisa disponível' : 'camisas disponíveis'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <CatalogCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#141414] text-gray-400 py-8 mt-8">
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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="aspect-square bg-gray-50 flex items-center justify-center">
          {product.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo_url} alt={product.team} className="h-full w-full object-cover" />
          ) : (
            <ShirtPlaceholder />
          )}
        </div>
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.team}</p>
          <p className="text-xs text-gray-500">
            {product.season ?? ''} · {MODEL_LABELS[product.model]} · {product.size}
          </p>
          {product.quantity === 1 && (
            <span className="inline-flex self-start px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold">
              Última unidade!
            </span>
          )}
          <p className="text-base font-bold text-[#C9A84C] mt-auto pt-1">{formatCurrency(product.sell_price)}</p>
        </div>
      </div>
    </Link>
  )
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition ${
          value
            ? 'bg-[#141414] text-white border-[#141414]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        }`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
          value ? 'text-white' : 'text-gray-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
