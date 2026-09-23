'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge, Card, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils/format'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type Product = Database['public']['Tables']['products']['Row']
type SaleItem = Database['public']['Tables']['sale_items']['Row'] & { products: Product | null }
type Sale = Database['public']['Tables']['sales']['Row'] & { sale_items: SaleItem[] }

const SALE_STATUS_LABELS: Record<string, string> = {
  orcamento: 'Orçamento',
  reservada: 'Reservada',
  aguardando_pagamento: 'Aguardando pagamento',
  paga: 'Paga',
  enviada: 'Enviada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

const SALE_STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'> = {
  orcamento: 'neutral',
  reservada: 'info',
  aguardando_pagamento: 'warning',
  paga: 'success',
  enviada: 'info',
  entregue: 'success',
  cancelada: 'danger',
}

export default function CustomerDetailPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { isAdmin } = useAuth()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function loadData() {
    setLoading(true)
    try {
      const [customerRes, salesRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', params.id).single(),
        supabase
          .from('sales')
          .select('*, sale_items(*, products(*))')
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false }),
      ])

      if (customerRes.error) throw customerRes.error
      setCustomer(customerRes.data)
      setSales((salesRes.data as Sale[]) ?? [])
    } catch {
      toast.error('Erro ao carregar cliente.')
      router.push('/clientes')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('customers').delete().eq('id', params.id)
      if (error) throw error
      toast.success('Cliente excluído com sucesso!')
      router.push('/clientes')
    } catch {
      toast.error('Erro ao excluir cliente.')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const stats = useMemo(() => {
    const validSales = sales.filter((s) => s.sale_status !== 'cancelada')
    const totalSpent = validSales.reduce((sum, s) => sum + (s.total ?? 0), 0)
    const totalPending = validSales.reduce((sum, s) => sum + (s.amount_pending ?? 0), 0)
    const lastPurchase = sales[0]?.created_at ?? null

    const teams = new Set<string>()
    const sizes = new Set<string>()
    for (const sale of sales) {
      for (const item of sale.sale_items ?? []) {
        if (item.products?.team) teams.add(item.products.team)
        if (item.products?.size) sizes.add(item.products.size)
      }
    }

    return {
      totalSpent,
      totalPending,
      lastPurchase,
      teams: Array.from(teams),
      sizes: Array.from(sizes),
    }
  }, [sales])

  if (loading) {
    return (
      <AppLayout title="Cliente" showBack>
        <LoadingSpinner label="Carregando cliente..." />
      </AppLayout>
    )
  }

  if (!customer) return null

  const whatsappDigits = (customer.whatsapp ?? '').replace(/\D/g, '')
  const whatsappHref = whatsappDigits ? `https://wa.me/55${whatsappDigits}` : null
  const instagramHref = customer.instagram
    ? `https://instagram.com/${customer.instagram.replace(/^@/, '')}`
    : null

  return (
    <AppLayout
      title={customer.name}
      showBack
      action={
        isAdmin ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/clientes/${customer.id}/editar`}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-900 transition-colors"
              aria-label="Editar cliente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Excluir cliente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5 pb-10">
        <Card className="p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
            {(customer.city || customer.state) && (
              <p className="text-sm text-gray-500">
                {[customer.city, customer.state].filter(Boolean).join(' - ')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.favorite_team && <Badge status="primary">{customer.favorite_team}</Badge>}
            {customer.preferred_size && <Badge status="neutral">Tam. {customer.preferred_size}</Badge>}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-700 font-medium hover:underline"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.87.512 3.633 1.4 5.14L2 22l4.998-1.386A9.96 9.96 0 0012.004 22C17.522 22 22 17.522 22 12.004 22 6.486 17.522 2 12.004 2zm0 18.166a8.14 8.14 0 01-4.15-1.135l-.298-.177-2.965.823.79-2.892-.194-.298a8.14 8.14 0 01-1.253-4.483c0-4.503 3.665-8.168 8.17-8.168 2.183 0 4.234.85 5.778 2.394a8.113 8.113 0 012.392 5.777c0 4.504-3.665 8.16-8.27 8.16z" />
                </svg>
                {formatPhone(customer.whatsapp ?? '')}
              </a>
            ) : (
              <p className="text-sm text-gray-400">WhatsApp não informado</p>
            )}

            {instagramHref ? (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-800 font-medium hover:underline"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={1.8} />
                  <circle cx="12" cy="12" r="3.5" strokeWidth={1.8} />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
                {customer.instagram}
              </a>
            ) : (
              <p className="text-sm text-gray-400">Instagram não informado</p>
            )}
          </div>

          {customer.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-gray-500">Total gasto</p>
            <p className="mt-1 text-xl font-bold text-accent-600 tabular-nums">{formatCurrency(stats.totalSpent)}</p>
          </Card>
          <Card className={`p-4 ${stats.totalPending > 0 ? 'bg-amber-50 border-amber-100' : ''}`}>
            <p className={`text-xs ${stats.totalPending > 0 ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>Pendente</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${stats.totalPending > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
              {formatCurrency(stats.totalPending)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500">Última compra</p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              {stats.lastPurchase ? formatDate(stats.lastPurchase) : '-'}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500">Total de compras</p>
            <p className="mt-1 text-base font-semibold text-gray-900 tabular-nums">{sales.length}</p>
          </Card>
        </div>

        {(stats.teams.length > 0 || stats.sizes.length > 0) && (
          <Card className="p-4 flex flex-col gap-3">
            {stats.teams.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Times comprados</p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.teams.map((team) => (
                    <Badge key={team} status="primary">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {stats.sizes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Tamanhos comprados</p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.sizes.map((size) => (
                    <Badge key={size} status="neutral">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Histórico de compras</h3>
          {sales.length === 0 ? (
            <EmptyState title="Nenhuma compra registrada" description="Este cliente ainda não fez compras." />
          ) : (
            <div className="flex flex-col gap-3">
              {sales.map((sale) => (
                <Card key={sale.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">#{sale.code}</p>
                      <p className="text-xs text-gray-500">{formatDate(sale.created_at)}</p>
                    </div>
                    <Badge status={SALE_STATUS_BADGE[sale.sale_status] ?? 'neutral'}>
                      {SALE_STATUS_LABELS[sale.sale_status] ?? sale.sale_status}
                    </Badge>
                  </div>

                  {sale.sale_items && sale.sale_items.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
                      {sale.sale_items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                          <span className="truncate">
                            {item.quantity}x {item.products?.team ?? 'Produto'}
                            {item.products?.size ? ` (${item.products.size})` : ''}
                          </span>
                          <span className="shrink-0 font-medium text-gray-800">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500">
                      {sale.amount_pending > 0 ? `Pendente: ${formatCurrency(sale.amount_pending)}` : 'Pago'}
                    </span>
                    <span className="text-sm font-bold text-primary-900">{formatCurrency(sale.total)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir cliente?"
        description={`Tem certeza que deseja excluir "${customer.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={deleting}
      />
    </AppLayout>
  )
}
