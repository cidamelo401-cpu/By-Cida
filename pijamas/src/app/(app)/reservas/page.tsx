'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge, Button, Card, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { updateSaleStatus } from '@/lib/actions/sales'
import type { Database } from '@/types/database'

type Sale = Database['public']['Tables']['sales']['Row'] & {
  customers: { name: string; whatsapp: string | null } | null
  sale_items: { id: string; quantity: number; products: { name: string; size: string } | null }[]
}

function ClockIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function ReservasPage() {
  const supabase = createClient()
  const { user } = useAuth()

  const [reservations, setReservations] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [cancelingAll, setCancelingAll] = useState(false)

  useEffect(() => {
    loadReservations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadReservations() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name, whatsapp), sale_items(*, products(name, size))')
        .eq('sale_status', 'reservada')
        .order('reservation_deadline', { ascending: true })
      if (error) throw error
      setReservations((data as unknown as Sale[]) ?? [])
    } catch {
      toast.error('Erro ao carregar reservas.')
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (sale: Sale) =>
    Boolean(sale.reservation_deadline && new Date(sale.reservation_deadline).getTime() < Date.now())

  const overdue = reservations.filter(isOverdue)

  async function cancelReservation(id: string) {
    if (!user) return
    setCanceling(true)
    try {
      await updateSaleStatus(id, 'cancelada')
      toast.success('Reserva cancelada e estoque liberado.')
      setCancelId(null)
      await loadReservations()
    } catch {
      toast.error('Erro ao cancelar reserva.')
    } finally {
      setCanceling(false)
    }
  }

  async function cancelAllOverdue() {
    if (!user) return
    setCancelingAll(true)
    try {
      await Promise.all(overdue.map((s) => updateSaleStatus(s.id, 'cancelada')))
      toast.success('Reservas vencidas canceladas e estoque liberado.')
      setBannerDismissed(true)
      await loadReservations()
    } catch {
      toast.error('Erro ao cancelar reservas vencidas.')
    } finally {
      setCancelingAll(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-bold text-gray-900">Reservas</h1>

        {!bannerDismissed && overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-sm text-red-800 font-medium">
              {overdue.length} {overdue.length === 1 ? 'reserva vencida' : 'reservas vencidas'}. Deseja cancelá-las e liberar o estoque?
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={cancelAllOverdue} loading={cancelingAll}>
                Cancelar vencidas
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setBannerDismissed(true)}>
                Agora não
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Carregando reservas..." />
        ) : reservations.length === 0 ? (
          <EmptyState icon={<ClockIcon />} title="Nenhuma reserva ativa" description="Reservas aparecerão aqui quando uma venda for marcada como reservada." />
        ) : (
          <div className="flex flex-col gap-3 pb-10">
            {reservations.map((sale) => {
              const late = isOverdue(sale)
              const itemsSummary = sale.sale_items
                .map((item) => `${item.products?.name ?? '—'} (${item.products?.size ?? '-'}) x${item.quantity}`)
                .join(', ')
              return (
                <Card key={sale.id} className={`p-4 flex flex-col gap-2 ${late ? 'border-red-300 bg-red-50/60' : 'border-yellow-200 bg-yellow-50/40'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/vendas/${sale.id}`}>
                      <div>
                        <p className="font-semibold text-gray-900">{sale.code}</p>
                        <p className="text-sm text-gray-600">{sale.customers?.name ?? 'Cliente não informado'}</p>
                      </div>
                    </Link>
                    <span className="text-sm font-bold text-accent-600">{formatCurrency(sale.total)}</span>
                  </div>

                  {itemsSummary && <p className="text-xs text-gray-500">{itemsSummary}</p>}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Badge status={late ? 'danger' : 'warning'}>
                      {late ? 'Vencida' : 'No prazo'} · até {sale.reservation_deadline ? formatDateTime(sale.reservation_deadline) : '-'}
                    </Badge>
                    <Button size="sm" variant="danger" onClick={() => setCancelId(sale.id)} type="button">
                      Cancelar reserva
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelId)}
        title="Cancelar reserva?"
        description="A venda será marcada como cancelada e o estoque reservado será devolvido automaticamente."
        confirmLabel="Cancelar reserva"
        danger
        loading={canceling}
        onConfirm={async () => {
          if (cancelId) await cancelReservation(cancelId)
        }}
        onCancel={() => setCancelId(null)}
      />
    </AppLayout>
  )
}
