'use client'

import { useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Badge, Button, Card, Input, LoadingSpinner } from '@/components/ui'
import { exportToCSV, formatCurrency, formatDate } from '@/lib/utils/format'
import { SIZE_OPTIONS } from '@/lib/constants/products'
import type { Database, ProductSize, SaleChannel, SaleStatus } from '@/types/database'

type Sale = Database['public']['Tables']['sales']['Row']

const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  orcamento: 'Orçamento',
  reservada: 'Reservada',
  aguardando_pagamento: 'Aguard. Pagamento',
  paga: 'Paga',
  enviada: 'Enviada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

const CHANNEL_LABELS: Record<SaleChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function monthAgoISO() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function rangeToTimestamps(start: string, end: string) {
  const startTs = new Date(`${start}T00:00:00`).toISOString()
  const endTs = new Date(`${end}T23:59:59`).toISOString()
  return { startTs, endTs }
}

/* ---------------------------------------------------------------- */
/* Collapsible section shell with lazy loading                       */
/* ---------------------------------------------------------------- */

type SectionProps = {
  title: string
  description?: string
  onExport?: () => void
  exportDisabled?: boolean
  onExpand: () => void | Promise<void>
  children: ReactNode
}

function ReportSection({ title, description, onExport, exportDisabled, onExpand, children }: SectionProps) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      setLoading(true)
      try {
        await onExpand()
        setLoaded(true)
      } catch (err) {
        console.error(err)
        toast.error(`Erro ao carregar "${title}".`)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4">
          {onExport && (
            <div className="flex justify-end mb-3">
              <Button size="sm" variant="secondary" onClick={onExport} disabled={exportDisabled}>
                Exportar CSV
              </Button>
            </div>
          )}
          {loading ? <LoadingSpinner label="Carregando..." /> : children}
        </div>
      )}
    </Card>
  )
}

/* ---------------------------------------------------------------- */

export default function ReportsPage() {
  const supabase = createClient()

  const [startDate, setStartDate] = useState(monthAgoISO())
  const [endDate, setEndDate] = useState(todayISO())

  // Section 1: Vendas por período
  const [salesInRange, setSalesInRange] = useState<(Sale & { customer_name: string | null })[]>([])

  // Section 2: Lucro estimado
  const [profitData, setProfitData] = useState<{
    revenue: number
    cost: number
    profit: number
    bySale: { code: string; profit: number }[]
  } | null>(null)

  // Section 3: Produtos mais vendidos
  const [topProducts, setTopProducts] = useState<
    { name: string; size: string; qty: number; revenue: number }[]
  >([])

  // Section 4: Estoque por tamanho
  const [stockBySize, setStockBySize] = useState<
    Record<ProductSize, { available: number; reserved: number }>
  >({} as Record<ProductSize, { available: number; reserved: number }>)

  // Section 5: Camisas paradas
  const [staleProducts, setStaleProducts] = useState<
    { name: string; size: string; days: number | null }[]
  >([])

  // Section 6: Valores pendentes
  const [pendingSales, setPendingSales] = useState<(Sale & { customer_name: string | null })[]>([])

  // Section 7: Clientes que mais compraram
  const [topCustomers, setTopCustomers] = useState<
    { name: string; count: number; total: number }[]
  >([])

  // Section 8: Vendas por canal
  const [byChannel, setByChannel] = useState<
    { channel: SaleChannel; count: number; total: number }[]
  >([])

  /* ---- loaders ---- */

  async function loadSalesInRange() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const { data, error } = await supabase
      .from('sales')
      .select('*, customers(name)')
      .gte('created_at', startTs)
      .lte('created_at', endTs)
      .order('created_at', { ascending: false })
    if (error) throw error
    setSalesInRange(
      ((data as (Sale & { customers: { name: string } | null })[] | null) ?? []).map((s) => ({
        ...s,
        customer_name: s.customers?.name ?? null,
      }))
    )
  }

  async function loadProfit() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const { data, error } = await supabase
      .from('sale_items')
      .select('quantity, unit_price, cost_price, sales!inner(code, created_at, sale_status)')
      .gte('sales.created_at', startTs)
      .lte('sales.created_at', endTs)
      .neq('sales.sale_status', 'cancelada')
    if (error) throw error

    type ProfitItem = { quantity: number; unit_price: number; cost_price: number; sales: { code: string } | null }

    let revenue = 0
    let cost = 0
    const bySaleMap = new Map<string, number>()
    ;((data as ProfitItem[] | null) ?? []).forEach((item) => {
      const itemRevenue = item.unit_price * item.quantity
      const itemCost = item.cost_price * item.quantity
      revenue += itemRevenue
      cost += itemCost
      const code = item.sales?.code ?? '—'
      bySaleMap.set(code, (bySaleMap.get(code) ?? 0) + (itemRevenue - itemCost))
    })

    setProfitData({
      revenue,
      cost,
      profit: revenue - cost,
      bySale: Array.from(bySaleMap.entries()).map(([code, profit]) => ({ code, profit })),
    })
  }

  async function loadTopProducts() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const { data, error } = await supabase
      .from('sale_items')
      .select('quantity, unit_price, product_id, sales!inner(created_at, sale_status), products(name, size)')
      .gte('sales.created_at', startTs)
      .lte('sales.created_at', endTs)
      .neq('sales.sale_status', 'cancelada')
    if (error) throw error

    type TopProductItem = {
      quantity: number
      unit_price: number
      product_id: string | null
      products: { name: string; size: string } | null
    }

    const map = new Map<string, { name: string; size: string; qty: number; revenue: number }>()
    ;((data as TopProductItem[] | null) ?? []).forEach((item) => {
      const name = item.products?.name ?? 'Produto removido'
      const size = item.products?.size ?? '-'
      const key = `${item.product_id ?? name}-${size}`
      const entry = map.get(key) ?? { name, size, qty: 0, revenue: 0 }
      entry.qty += item.quantity
      entry.revenue += item.quantity * item.unit_price
      map.set(key, entry)
    })

    setTopProducts(Array.from(map.values()).sort((a, b) => b.qty - a.qty))
  }

  async function loadStockBySize() {
    const [productsRes, reservedRes] = await Promise.all([
      supabase.from('products').select('size, quantity').eq('archived', false),
      supabase
        .from('sale_items')
        .select('quantity, products(size), sales!inner(sale_status)')
        .eq('sales.sale_status', 'reservada'),
    ])
    if (productsRes.error) throw productsRes.error
    if (reservedRes.error) throw reservedRes.error

    const result = SIZE_OPTIONS.reduce((acc, size) => {
      acc[size] = { available: 0, reserved: 0 }
      return acc
    }, {} as Record<ProductSize, { available: number; reserved: number }>)

    ;(productsRes.data ?? []).forEach((p) => {
      if (result[p.size as ProductSize]) result[p.size as ProductSize].available += p.quantity
    })
    type ReservedItem = { quantity: number; products: { size: string } | null }
    ;((reservedRes.data as ReservedItem[] | null) ?? []).forEach((item) => {
      const size = item.products?.size as ProductSize | undefined
      if (size && result[size]) result[size].reserved += item.quantity
    })

    setStockBySize(result)
  }

  async function loadStaleProducts() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const [productsRes, movementsRes] = await Promise.all([
      supabase.from('products').select('id, name, size').eq('archived', false),
      supabase
        .from('stock_movements')
        .select('product_id, created_at, type')
        .eq('type', 'venda')
        .gte('created_at', startTs)
        .lte('created_at', endTs),
    ])
    if (productsRes.error) throw productsRes.error
    if (movementsRes.error) throw movementsRes.error

    const soldIds = new Set((movementsRes.data ?? []).map((m) => m.product_id))

    // last movement overall (any type) to compute "days since"
    const { data: lastMoves } = await supabase
      .from('stock_movements')
      .select('product_id, created_at')
      .order('created_at', { ascending: false })

    const lastMoveByProduct = new Map<string, string>()
    ;(lastMoves ?? []).forEach((m) => {
      if (!lastMoveByProduct.has(m.product_id)) lastMoveByProduct.set(m.product_id, m.created_at)
    })

    const stale = (productsRes.data ?? [])
      .filter((p) => !soldIds.has(p.id))
      .map((p) => {
        const last = lastMoveByProduct.get(p.id)
        const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : null
        return { name: p.name, size: p.size, days }
      })
      .sort((a, b) => (b.days ?? Infinity) - (a.days ?? Infinity))

    setStaleProducts(stale)
  }

  async function loadPendingSales() {
    const { data, error } = await supabase
      .from('sales')
      .select('*, customers(name)')
      .gt('amount_pending', 0)
      .neq('sale_status', 'cancelada')
      .order('due_date', { ascending: true, nullsFirst: false })
    if (error) throw error
    setPendingSales(
      ((data as (Sale & { customers: { name: string } | null })[] | null) ?? []).map((s) => ({
        ...s,
        customer_name: s.customers?.name ?? null,
      }))
    )
  }

  async function loadTopCustomers() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const { data, error } = await supabase
      .from('sales')
      .select('total, customers(name)')
      .gte('created_at', startTs)
      .lte('created_at', endTs)
      .neq('sale_status', 'cancelada')
      .not('customer_id', 'is', null)
    if (error) throw error

    type TopCustomerItem = { total: number; customers: { name: string } | null }

    const map = new Map<string, { name: string; count: number; total: number }>()
    ;((data as TopCustomerItem[] | null) ?? []).forEach((s) => {
      const name = s.customers?.name ?? 'Cliente'
      const entry = map.get(name) ?? { name, count: 0, total: 0 }
      entry.count += 1
      entry.total += s.total
      map.set(name, entry)
    })

    setTopCustomers(Array.from(map.values()).sort((a, b) => b.total - a.total))
  }

  async function loadByChannel() {
    const { startTs, endTs } = rangeToTimestamps(startDate, endDate)
    const { data, error } = await supabase
      .from('sales')
      .select('channel, total')
      .gte('created_at', startTs)
      .lte('created_at', endTs)
      .neq('sale_status', 'cancelada')
    if (error) throw error

    type ChannelItem = { channel: SaleChannel; total: number }

    const map = new Map<SaleChannel, { count: number; total: number }>()
    ;((data as ChannelItem[] | null) ?? []).forEach((s) => {
      const entry = map.get(s.channel) ?? { count: 0, total: 0 }
      entry.count += 1
      entry.total += s.total
      map.set(s.channel, entry)
    })

    setByChannel(Array.from(map.entries()).map(([channel, v]) => ({ channel, ...v })))
  }

  /* ---- exports ---- */

  function exportSalesInRange() {
    exportToCSV(
      salesInRange.map((s) => ({
        Data: formatDate(s.created_at),
        Código: s.code,
        Cliente: s.customer_name ?? '-',
        Total: s.total,
        Status: SALE_STATUS_LABELS[s.sale_status],
      })),
      'vendas-por-periodo'
    )
  }

  function exportTopProducts() {
    exportToCSV(
      topProducts.map((p) => ({
        Produto: p.name,
        Tamanho: p.size,
        'Qtd. Vendida': p.qty,
        Receita: p.revenue,
      })),
      'produtos-mais-vendidos'
    )
  }

  function exportPendingSales() {
    exportToCSV(
      pendingSales.map((s) => ({
        Cliente: s.customer_name ?? '-',
        Código: s.code,
        Total: s.total,
        Pago: s.amount_paid,
        Pendente: s.amount_pending,
        Vencimento: s.due_date ? formatDate(s.due_date) : '-',
      })),
      'valores-pendentes'
    )
  }

  function exportTopCustomers() {
    exportToCSV(
      topCustomers.map((c) => ({
        Cliente: c.name,
        'Total de Compras': c.count,
        'Valor Gasto': c.total,
      })),
      'clientes-que-mais-compraram'
    )
  }

  const totalRangeValue = salesInRange.reduce((sum, s) => sum + s.total, 0)
  const maxStockAvailable = Math.max(1, ...Object.values(stockBySize).map((v) => v.available))
  const totalChannelValue = byChannel.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Data inicial"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input type="date" label="Data final" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </Card>

      {/* 1. Vendas por período */}
      <ReportSection
        title="Vendas por período"
        description="Todas as vendas no intervalo selecionado"
        onExpand={loadSalesInRange}
        onExport={exportSalesInRange}
        exportDisabled={salesInRange.length === 0}
      >
        {salesInRange.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Código</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {salesInRange.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 whitespace-nowrap">{formatDate(s.created_at)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{s.code}</td>
                    <td className="py-2 pr-3">{s.customer_name ?? '-'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatCurrency(s.total)}</td>
                    <td className="py-2 pr-3">
                      <Badge status="neutral">{SALE_STATUS_LABELS[s.sale_status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-gray-900">
                  <td className="py-2 pr-3" colSpan={3}>
                    Total
                  </td>
                  <td className="py-2 pr-3">{formatCurrency(totalRangeValue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ReportSection>

      {/* 2. Lucro estimado */}
      <ReportSection title="Lucro estimado" description="Receita, custo e lucro bruto do período" onExpand={loadProfit}>
        {profitData && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Receita total</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(profitData.revenue)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Custo total</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(profitData.cost)}</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-3">
                <p className="text-xs text-gray-500">Lucro bruto</p>
                <p className="text-lg font-bold text-primary-900">{formatCurrency(profitData.profit)}</p>
              </div>
            </div>
            {profitData.bySale.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="py-2 pr-3">Venda</th>
                      <th className="py-2 pr-3">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.bySale.map((s) => (
                      <tr key={s.code} className="border-b border-gray-50">
                        <td className="py-2 pr-3">{s.code}</td>
                        <td className={`py-2 pr-3 ${s.profit < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCurrency(s.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </ReportSection>

      {/* 3. Produtos mais vendidos */}
      <ReportSection
        title="Produtos mais vendidos"
        description="Ranking por quantidade vendida no período"
        onExpand={loadTopProducts}
        onExport={exportTopProducts}
        exportDisabled={topProducts.length === 0}
      >
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Tamanho</th>
                  <th className="py-2 pr-3">Qtd.</th>
                  <th className="py-2 pr-3">Receita</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={`${p.name}-${p.size}-${i}`} className="border-b border-gray-50">
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3">{p.name}</td>
                    <td className="py-2 pr-3">{p.size}</td>
                    <td className="py-2 pr-3">{p.qty}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* 4. Estoque por tamanho */}
      <ReportSection title="Estoque por tamanho" description="Disponível vs. reservado" onExpand={loadStockBySize}>
        <div className="flex flex-col gap-2">
          {SIZE_OPTIONS.map((size) => {
            const entry = stockBySize[size] ?? { available: 0, reserved: 0 }
            const pct = Math.round((entry.available / maxStockAvailable) * 100)
            return (
              <div key={size} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-sm font-medium text-gray-600">{size}</span>
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-600"
                    style={{ width: `${Math.max(pct, entry.available > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-xs text-right text-gray-500">
                  {entry.available} disp. · {entry.reserved} res.
                </span>
              </div>
            )
          })}
        </div>
      </ReportSection>

      {/* 5. Camisas paradas */}
      <ReportSection
        title="Camisas paradas"
        description="Produtos sem venda registrada no período"
        onExpand={loadStaleProducts}
      >
        {staleProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Todos os produtos tiveram vendas no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Tamanho</th>
                  <th className="py-2 pr-3">Dias sem movimentação</th>
                </tr>
              </thead>
              <tbody>
                {staleProducts.map((p, i) => (
                  <tr key={`${p.name}-${p.size}-${i}`} className="border-b border-gray-50">
                    <td className="py-2 pr-3">{p.name}</td>
                    <td className="py-2 pr-3">{p.size}</td>
                    <td className="py-2 pr-3">{p.days === null ? 'Sem registro' : `${p.days} dias`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* 6. Valores pendentes */}
      <ReportSection
        title="Valores pendentes"
        description="Vendas com saldo em aberto"
        onExpand={loadPendingSales}
        onExport={exportPendingSales}
        exportDisabled={pendingSales.length === 0}
      >
        {pendingSales.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum valor pendente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Código</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Pago</th>
                  <th className="py-2 pr-3">Pendente</th>
                  <th className="py-2 pr-3">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {pendingSales.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">{s.customer_name ?? '-'}</td>
                    <td className="py-2 pr-3">{s.code}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatCurrency(s.total)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatCurrency(s.amount_paid)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-red-600 font-medium">
                      {formatCurrency(s.amount_pending)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{s.due_date ? formatDate(s.due_date) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* 7. Clientes que mais compraram */}
      <ReportSection
        title="Clientes que mais compraram"
        description="Ranking por valor gasto no período"
        onExpand={loadTopCustomers}
        onExport={exportTopCustomers}
        exportDisabled={topCustomers.length === 0}
      >
        {topCustomers.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma compra no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Compras</th>
                  <th className="py-2 pr-3">Total Gasto</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.name + i} className="border-b border-gray-50">
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3">{c.name}</td>
                    <td className="py-2 pr-3">{c.count}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatCurrency(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* 8. Vendas por canal */}
      <ReportSection title="Vendas por canal" description="WhatsApp vs. Instagram" onExpand={loadByChannel}>
        {byChannel.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {byChannel.map((c) => {
              const pct = totalChannelValue > 0 ? Math.round((c.total / totalChannelValue) * 100) : 0
              return (
                <div key={c.channel}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{CHANNEL_LABELS[c.channel]}</span>
                    <span className="text-gray-500">
                      {c.count} vendas · {formatCurrency(c.total)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ReportSection>
    </div>
  )
}
