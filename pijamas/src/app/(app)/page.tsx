'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Badge, Button, Card, EmptyState, LoadingSpinner, StatCard } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { SIZE_OPTIONS } from '@/lib/constants/products'
import type { Database, ProductSize, SaleStatus } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
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

const SALE_STATUS_BADGE: Record<SaleStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  orcamento: 'neutral',
  reservada: 'warning',
  aguardando_pagamento: 'warning',
  paga: 'success',
  enviada: 'info',
  entregue: 'success',
  cancelada: 'danger',
}

function ShirtIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

function MoneyIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"
      />
    </svg>
  )
}

function ChartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

type DashboardData = {
  totalAvailable: number
  totalReserved: number
  investedValue: number
  potentialValue: number
  salesThisMonth: number
  profitThisMonth: number
  pendingAmount: number
  stockBySize: Record<ProductSize, number>
  lowStock: Product[]
  recentSales: (Sale & { customer_name: string | null })[]
}

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        productsRes,
        reservedItemsRes,
        monthSalesRes,
        monthItemsRes,
        pendingSalesRes,
        recentSalesRes,
      ] = await Promise.all([
        supabase.from('products').select('*').eq('archived', false),
        supabase
          .from('sale_items')
          .select('quantity, sales!inner(sale_status)')
          .eq('sales.sale_status', 'reservada'),
        supabase
          .from('sales')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)
          .in('sale_status', ['paga', 'enviada', 'entregue']),
        supabase
          .from('sale_items')
          .select('quantity, unit_price, cost_price, sales!inner(sale_status, created_at)')
          .gte('sales.created_at', monthStart)
          .in('sales.sale_status', ['paga', 'enviada', 'entregue']),
        supabase
          .from('sales')
          .select('amount_pending')
          .gt('amount_pending', 0)
          .neq('sale_status', 'cancelada'),
        supabase
          .from('sales')
          .select('*, customers(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (productsRes.error) throw productsRes.error
      const products = productsRes.data ?? []

      const totalAvailable = products
        .filter((p) => p.status !== 'esgotado')
        .reduce((sum, p) => sum + p.quantity, 0)

      const investedValue = products.reduce((sum, p) => sum + p.cost_price * p.quantity, 0)
      const potentialValue = products.reduce((sum, p) => sum + p.sell_price * p.quantity, 0)

      const totalReserved = (reservedItemsRes.data as { quantity: number }[] | null ?? []).reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0
      )

      const salesThisMonth = monthSalesRes.count ?? 0

      const profitThisMonth = (
        (monthItemsRes.data as { quantity: number; unit_price: number; cost_price: number }[] | null) ?? []
      ).reduce((sum, item) => sum + (item.unit_price - item.cost_price) * item.quantity, 0)

      const pendingAmount = (pendingSalesRes.data ?? []).reduce(
        (sum, s) => sum + (s.amount_pending ?? 0),
        0
      )

      const stockBySize = SIZE_OPTIONS.reduce((acc, size) => {
        acc[size] = 0
        return acc
      }, {} as Record<ProductSize, number>)
      products.forEach((p) => {
        stockBySize[p.size] = (stockBySize[p.size] ?? 0) + p.quantity
      })

      const lowStock = products
        .filter((p) => p.quantity <= p.min_stock)
        .sort((a, b) => a.quantity - a.min_stock - (b.quantity - b.min_stock))

      const recentSales = (
        (recentSalesRes.data as (Sale & { customers: { name: string } | null })[] | null) ?? []
      ).map((s) => ({
        ...s,
        customer_name: s.customers?.name ?? null,
      }))

      setData({
        totalAvailable,
        totalReserved,
        investedValue,
        potentialValue,
        salesThisMonth,
        profitThisMonth,
        pendingAmount,
        stockBySize,
        lowStock,
        recentSales,
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar o dashboard.')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 h-24 animate-pulse bg-gray-50">
              {null}
            </Card>
          ))}
        </div>
        <LoadingSpinner fullScreen label="Carregando dashboard..." />
      </div>
    )
  }

  const maxBySize = Math.max(1, ...Object.values(data.stockBySize))

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/vendas/nova">
          <Button fullWidth>+ Nova Venda</Button>
        </Link>
        <Link href="/produtos/novo">
          <Button fullWidth variant="secondary">
            + Novo Pijama
          </Button>
        </Link>
        <Link href="/leads">
          <Button fullWidth variant="secondary">
            🔔 Ver Leads
          </Button>
        </Link>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Pijamas disponíveis"
          value={data.totalAvailable}
          icon={<ShirtIcon />}
        />
        <StatCard
          label="Pijamas reservados"
          value={data.totalReserved}
          icon={<ShirtIcon className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          label="Valor investido"
          value={formatCurrency(data.investedValue)}
          icon={<MoneyIcon className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          label="Valor potencial de venda"
          value={formatCurrency(data.potentialValue)}
          icon={<MoneyIcon className="h-5 w-5 text-green-700" />}
        />
      </div>

      {/* Second stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Vendas do mês" value={data.salesThisMonth} icon={<CartIcon />} />
        <StatCard
          label="Lucro estimado do mês"
          value={formatCurrency(data.profitThisMonth)}
          icon={<ChartIcon className="h-5 w-5 text-green-700" />}
        />
        <StatCard
          label="Valores pendentes"
          value={formatCurrency(data.pendingAmount)}
          icon={<ClockIcon className="h-5 w-5 text-amber-600" />}
        />
      </div>

      {/* Estoque por tamanho */}
      <Card className="p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Estoque por tamanho</h2>
        <div className="flex flex-col gap-2">
          {SIZE_OPTIONS.map((size) => {
            const qty = data.stockBySize[size] ?? 0
            const pct = Math.round((qty / maxBySize) * 100)
            return (
              <div key={size} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-sm font-medium text-gray-600">{size}</span>
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${Math.max(pct, qty > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-sm text-right text-gray-500">{qty}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com estoque baixo */}
        <Card className="p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Produtos com estoque baixo</h2>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum produto abaixo do estoque mínimo.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.lowStock.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">Tamanho {p.size}</p>
                  </div>
                  <Badge status="warning">
                    {p.quantity} / mín. {p.min_stock}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Últimas vendas */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimas vendas</h2>
            <Link href="/vendas" className="text-sm font-medium text-primary-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {data.recentSales.length === 0 ? (
            <EmptyState title="Nenhuma venda ainda" description="As vendas mais recentes aparecerão aqui." />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{s.code}</p>
                    <p className="text-xs text-gray-500">
                      {s.customer_name ?? 'Cliente não informado'} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.total)}</span>
                    <Badge status={SALE_STATUS_BADGE[s.sale_status]}>{SALE_STATUS_LABELS[s.sale_status]}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
