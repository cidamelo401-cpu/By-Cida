'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge, Card, EmptyState, LoadingSpinner, SearchInput } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/format'
import {
  MODEL_LABELS,
  SIZE_OPTIONS,
  STATUS_BADGE,
  STATUS_LABELS,
  FABRIC_LABELS,
} from '@/lib/constants/products'
import type { Database, ProductModel, ProductSize, ProductStatus, ProductFabric } from '@/types/database'
import toast from 'react-hot-toast'

type Product = Database['public']['Tables']['products']['Row']

function ShirtPlaceholder() {
  return (
    <svg className="h-16 w-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const [sizeFilter, setSizeFilter] = useState<ProductSize | ''>('')
  const [modelFilter, setModelFilter] = useState<ProductModel | ''>('')
  const [fabricFilter, setFabricFilter] = useState<ProductFabric | ''>('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const query = supabase.from('products').select('*').order('name')
        const { data, error } = showArchived ? await query : await query.eq('archived', false)
        if (error) throw error
        setProducts(data ?? [])
      } catch {
        toast.error('Erro ao carregar produtos.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (term) {
        const matchesTerm =
          p.name.toLowerCase().includes(term) || (p.sku ?? '').toLowerCase().includes(term)
        if (!matchesTerm) return false
      }
      if (sizeFilter && p.size !== sizeFilter) return false
      if (modelFilter && p.model !== modelFilter) return false
      if (fabricFilter && p.fabric !== fabricFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [products, search, sizeFilter, modelFilter, fabricFilter, statusFilter])

  const hasFilters = Boolean(sizeFilter || modelFilter || fabricFilter || statusFilter)

  return (
    <AppLayout title="Produtos">
      <div className="flex flex-col gap-5">
        <div className="hidden lg:flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">Produtos</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/produtos/fotos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              📷 Upload de Fotos
            </Link>
            <Link
              href="/produtos/novo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
            >
              + Novo Pijama
            </Link>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-500 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary-900"
          />
          Mostrar arquivados
        </label>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Buscar por nome ou SKU..."
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Tamanho"
            value={sizeFilter}
            options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
            onChange={(v) => setSizeFilter(v as ProductSize | '')}
          />
          <FilterChip
            label="Modelo"
            value={modelFilter}
            options={Object.entries(MODEL_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(v) => setModelFilter(v as ProductModel | '')}
          />
          <FilterChip
            label="Tecido"
            value={fabricFilter}
            options={Object.entries(FABRIC_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(v) => setFabricFilter(v as ProductFabric | '')}
          />
          <FilterChip
            label="Status"
            value={statusFilter}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(v) => setStatusFilter(v as ProductStatus | '')}
          />
          {hasFilters && (
            <button
              onClick={() => {
                setSizeFilter('')
                setModelFilter('')
                setFabricFilter('')
                setStatusFilter('')
              }}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-primary-900"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Carregando produtos..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShirtPlaceholder />}
            title="Nenhum pijama encontrado"
            description={
              products.length === 0
                ? 'Cadastre o primeiro pijama do seu estoque.'
                : 'Ajuste os filtros ou a busca para encontrar produtos.'
            }
            action={
              <Link
                href="/produtos/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                + Novo Pijama
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/produtos/novo"
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-800 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Novo Pijama
      </Link>
    </AppLayout>
  )
}

function ProductCard({ product }: { product: Product }) {
  const lowStock = product.quantity <= product.min_stock
  return (
    <Link href={`/produtos/${product.id}`}>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="aspect-square bg-primary-50 flex items-center justify-center relative">
          {product.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ShirtPlaceholder />
          )}
          {product.archived && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-800/80 text-white text-[10px] font-medium">
              Arquivado
            </span>
          )}
          <Badge status={STATUS_BADGE[product.status]} className="absolute top-2 right-2">
            {STATUS_LABELS[product.status]}
          </Badge>
        </div>
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</p>
          <p className="text-xs text-gray-500">
            {product.color ?? '—'} · {MODEL_LABELS[product.model]} / {FABRIC_LABELS[product.fabric]}
          </p>
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {product.size}
            </span>
            <span className={`text-xs font-semibold ${lowStock ? 'text-red-600' : 'text-gray-600'}`}>
              {product.quantity} un.
            </span>
          </div>
          <p className="text-sm font-bold text-accent-600">{formatCurrency(product.sell_price)}</p>
        </div>
      </Card>
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
        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border cursor-pointer ${
          value
            ? 'bg-primary-900 text-white border-primary-900'
            : 'bg-white text-gray-600 border-gray-200'
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
