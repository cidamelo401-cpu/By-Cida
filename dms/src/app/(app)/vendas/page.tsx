'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge, Card, EmptyState, LoadingSpinner, SearchInput } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  SALE_STATUS_BADGE,
  SALE_STATUS_LABELS,
  SALE_STATUS_STRIPE,
} from '@/lib/constants/sales'
import type { Database, SaleStatus } from '@/types/database'

type Sale = Database['public']['Tables']['sales']['Row'] & {
  customers: { name: string; whatsapp: string | null } | null
  sale_items: { id: string; quantity: number; products: { team: string; size: string; sku: string | null } | null }[]
}

const TABS: { value: SaleStatus | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'reservada', label: 'Reservada' },
  { value: 'aguardando_pagamento', label: 'Aguardando' },
  { value: 'paga', label: 'Paga' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelada', label: 'Cancelada' },
]

function ShoppingIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </svg>
  )
}

export default function VendasPage() {
  const supabase = createClient()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<SaleStatus | 'todas'>('todas')

  async function loadSales() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name, whatsapp), sale_items(*, products(team, size, sku))')
        .order('created_at', { ascending: false })
      if (error) throw error
      setSales((data as unknown as Sale[]) ?? [])
    } catch {
      toast.error('Erro ao carregar vendas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sales.filter((sale) => {
      if (tab !== 'todas' && sale.sale_status !== tab) return false
      if (term) {
        const matches =
          sale.code.toLowerCase().includes(term) || (sale.customers?.name ?? '').toLowerCase().includes(term)
        if (!matches) return false
      }
      return true
    })
  }, [sales, search, tab])

  const isOverdue = (sale: Sale) =>
    sale.sale_status === 'reservada' &&
    sale.reservation_deadline &&
    new Date(sale.reservation_deadline).getTime() < Date.now()

  const filteredTotal = filtered.reduce((sum, s) => sum + s.total, 0)

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vendas</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'venda' : 'vendas'}
              {filtered.length > 0 && <> · {formatCurrency(filteredTotal)}</>}
            </p>
          )}
        </div>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Buscar por cliente ou código..."
        />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Carregando vendas..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingIcon />}
            title="Nenhuma venda encontrada"
            description={
              sales.length === 0
                ? 'Registre a primeira venda para começar.'
                : 'Ajuste a busca ou os filtros para encontrar vendas.'
            }
            action={
              <Link
                href="/vendas/nova"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                + Nova Venda
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 pb-20">
            {filtered.map((sale) => {
              const overdue = isOverdue(sale)
              const itemsSummary = sale.sale_items
                .map((item) => `${item.products?.team ?? '—'} (${item.products?.size ?? '-'}) x${item.quantity}`)
                .join(', ')
              return (
                <Link key={sale.id} href={`/vendas/${sale.id}`}>
                  <Card
                    className={`p-4 flex flex-col gap-2 relative overflow-hidden ${overdue ? 'border-red-300 bg-red-50/50' : ''}`}
                  >
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${SALE_STATUS_STRIPE[sale.sale_status]}`} />
                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div>
                        <p className="font-semibold text-gray-900">{sale.code}</p>
                        <p className="text-sm text-gray-600">{sale.customers?.name ?? 'Cliente não informado'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-gray-400">{formatDate(sale.created_at)}</span>
                        <span className="text-sm font-bold text-accent-600">{formatCurrency(sale.total)}</span>
                      </div>
                    </div>

                    {itemsSummary && (
                      <p className="text-xs text-gray-500 line-clamp-2 pl-2">{itemsSummary}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pl-2">
                      <Badge status={SALE_STATUS_BADGE[sale.sale_status]}>
                        {SALE_STATUS_LABELS[sale.sale_status]}
                      </Badge>
                      {sale.payment_status !== 'pago' && (
                        <Badge status={PAYMENT_STATUS_BADGE[sale.payment_status]}>
                          {PAYMENT_STATUS_LABELS[sale.payment_status]}
                        </Badge>
                      )}
                      {overdue && (
                        <span className="text-xs font-semibold text-red-700 flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.71-3.03L13.71 3.86a2 2 0 00-3.42 0z" />
                          </svg>
                          Reserva vencida
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <Link
          href="/vendas/nova"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-800 transition-colors"
        >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nova Venda
        </Link>
      )}
    </AppLayout>
  )
}
