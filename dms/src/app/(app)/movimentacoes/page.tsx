'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, EmptyState, Input, LoadingSpinner, Select } from '@/components/ui'
import { exportToCSV, formatDateTime } from '@/lib/utils/format'
import { MOVEMENT_TYPE_LABELS } from '@/lib/constants/products'
import type { Database, StockMovementType } from '@/types/database'

type Movement = Database['public']['Tables']['stock_movements']['Row'] & {
  product_team: string | null
  product_size: string | null
  user_name: string | null
}

type ProductOption = {
  id: string
  team: string
  size: string
}

const PAGE_SIZE = 50

const MOVEMENT_TYPES: StockMovementType[] = [
  'entrada',
  'venda',
  'troca',
  'devolucao',
  'perda',
  'avaria',
  'ajuste',
]

function typeSign(type: StockMovementType) {
  return ['entrada', 'devolucao', 'ajuste'].includes(type) ? '' : '-'
}

export default function StockMovementsPage() {
  const supabase = createClient()

  const [movements, setMovements] = useState<Movement[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const [productFilter, setProductFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<StockMovementType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(0)
    setMovements([])
    setHasMore(true)
    loadMovements(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilter, typeFilter, startDate, endDate])

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('id, team, size').order('team')
    if (error) {
      toast.error('Erro ao carregar produtos.')
      return
    }
    setProducts((data ?? []).map((p) => ({ id: p.id, team: p.team, size: p.size })))
  }

  async function loadMovements(pageIndex: number, replace: boolean) {
    if (replace) setLoading(true)
    else setLoadingMore(true)

    try {
      let query = supabase
        .from('stock_movements')
        .select('*, products(team, size), profiles:created_by(full_name)')
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1)

      if (productFilter) query = query.eq('product_id', productFilter)
      if (typeFilter) query = query.eq('type', typeFilter)
      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`)

      const { data, error } = await query
      if (error) throw error

      type MovementRow = Database['public']['Tables']['stock_movements']['Row'] & {
        products: { team: string; size: string } | null
        profiles: { full_name: string | null } | null
      }

      const rows: Movement[] = ((data as MovementRow[] | null) ?? []).map((m) => ({
        ...m,
        product_team: m.products?.team ?? null,
        product_size: m.products?.size ?? null,
        user_name: m.profiles?.full_name ?? null,
      }))

      setMovements((prev) => (replace ? rows : [...prev, ...rows]))
      setHasMore(rows.length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar movimentações.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    loadMovements(next, false)
  }

  const filteredProductOptions = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return products
    return products.filter((p) => p.team.toLowerCase().includes(term))
  }, [products, productSearch])

  function handleExport() {
    exportToCSV(
      movements.map((m) => ({
        Data: formatDateTime(m.created_at),
        Produto: `${m.product_team ?? '-'} (${m.product_size ?? '-'})`,
        Tipo: MOVEMENT_TYPE_LABELS[m.type] ?? m.type,
        Quantidade: `${typeSign(m.type)}${m.quantity}`,
        Anterior: m.previous_quantity,
        Nova: m.new_quantity,
        Motivo: m.reason ?? '-',
        Usuário: m.user_name ?? '-',
      })),
      'movimentacoes-de-estoque'
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Movimentações de estoque</h1>
        <Button size="sm" variant="secondary" onClick={handleExport} disabled={movements.length === 0}>
          Exportar CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">Produto</label>
            <Input
              placeholder="Buscar time..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="mb-1"
            />
            <Select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">Todos os produtos</option>
              {filteredProductOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.team} ({p.size})
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as StockMovementType | '')}
          >
            <option value="">Todos os tipos</option>
            {MOVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {MOVEMENT_TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            label="Data inicial"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input type="date" label="Data final" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner fullScreen label="Carregando movimentações..." />
      ) : movements.length === 0 ? (
        <EmptyState title="Nenhuma movimentação encontrada" description="Ajuste os filtros ou aguarde novas movimentações de estoque." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Qtd.</th>
                  <th className="py-3 px-4">Anterior → Nova</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="py-2 px-4 whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      {m.product_team ?? 'Produto removido'} {m.product_size ? `(${m.product_size})` : ''}
                    </td>
                    <td className="py-2 px-4">{MOVEMENT_TYPE_LABELS[m.type] ?? m.type}</td>
                    <td
                      className={`py-2 px-4 font-medium whitespace-nowrap ${
                        typeSign(m.type) === '-' ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {typeSign(m.type)}
                      {m.quantity}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      {m.previous_quantity} → {m.new_quantity}
                    </td>
                    <td className="py-2 px-4">{m.reason ?? '-'}</td>
                    <td className="py-2 px-4 whitespace-nowrap">{m.user_name ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <Button variant="secondary" size="sm" loading={loadingMore} onClick={loadMore}>
                Carregar mais
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
