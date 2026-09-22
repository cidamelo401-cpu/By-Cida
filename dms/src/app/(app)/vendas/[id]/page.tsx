'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge, Button, Card, ConfirmDialog, CurrencyInput, Input, LoadingSpinner, Modal, Select } from '@/components/ui'
import { formatCurrency, formatDate, formatDateTime, formatPhone, getWhatsAppLink, parseCurrency } from '@/lib/utils/format'
import { deleteSale, registerPayment, updateSaleDetails, updateSaleStatus } from '@/lib/actions/sales'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  SALE_STATUS_BADGE,
  SALE_STATUS_LABELS,
  SALE_STATUS_STRIPE,
  SALE_STATUS_TRANSITIONS,
  SALE_STATUS_TRANSITION_MESSAGES,
} from '@/lib/constants/sales'
import type { Database, PaymentMethod, SaleStatus } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type SaleItem = Database['public']['Tables']['sale_items']['Row'] & {
  products: { team: string; size: string; sku: string | null } | null
}
type Payment = Database['public']['Tables']['payments']['Row']
type StatusHistory = Database['public']['Tables']['sale_status_history']['Row']
type Sale = Database['public']['Tables']['sales']['Row'] & {
  customers: Customer | null
  sale_items: SaleItem[]
}

export default function VendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  const [sale, setSale] = useState<Sale | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmStatus, setConfirmStatus] = useState<SaleStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [{ data: saleData, error }, { data: paymentsData }, { data: historyData }] = await Promise.all([
        supabase
          .from('sales')
          .select('*, customers(*), sale_items(*, products(team, size, sku))')
          .eq('id', id)
          .single(),
        supabase.from('payments').select('*').eq('sale_id', id).order('created_at', { ascending: false }),
        supabase
          .from('sale_status_history')
          .select('*')
          .eq('sale_id', id)
          .order('created_at', { ascending: false }),
      ])
      if (error) throw error
      setSale(saleData as unknown as Sale)
      setPayments(paymentsData ?? [])
      setHistory(historyData ?? [])
      setTrackingCode((saleData as unknown as Sale)?.tracking_code ?? '')
    } catch {
      toast.error('Erro ao carregar a venda.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusChange() {
    if (!sale || !confirmStatus || !user) return
    setStatusLoading(true)
    try {
      await updateSaleStatus(sale.id, confirmStatus)
      toast.success('Status atualizado!')
      setConfirmStatus(null)
      await loadAll()
    } catch {
      toast.error('Erro ao atualizar status.')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleRegisterPayment() {
    if (!sale || !user) return
    if (paymentAmount <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    setPaymentLoading(true)
    try {
      await registerPayment({
        sale_id: sale.id,
        amount: paymentAmount,
        method: paymentMethod,
        notes: paymentNotes || undefined,
        created_by: user.id,
      })
      toast.success('Pagamento registrado!')
      setShowPaymentModal(false)
      setPaymentAmount(0)
      setPaymentNotes('')
      await loadAll()
    } catch {
      toast.error('Erro ao registrar pagamento.')
    } finally {
      setPaymentLoading(false)
    }
  }

  async function handleSaveTracking() {
    if (!sale) return
    setTrackingLoading(true)
    try {
      await updateSaleDetails(sale.id, { tracking_code: trackingCode || null })
      toast.success('Código de rastreio salvo!')
      setShowTrackingModal(false)
      await loadAll()
    } catch {
      toast.error('Erro ao salvar rastreio.')
    } finally {
      setTrackingLoading(false)
    }
  }

  async function handleDeleteSale() {
    if (!sale) return
    setDeleteLoading(true)
    try {
      await deleteSale(sale.id)
      toast.success('Venda excluída e estoque restaurado!')
      router.push('/vendas')
    } catch {
      toast.error('Erro ao excluir a venda.')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function copyMessage(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Mensagem copiada!')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  if (loading) {
    return (
      <AppLayout title="Venda" showBack>
        <LoadingSpinner label="Carregando venda..." />
      </AppLayout>
    )
  }

  if (!sale) {
    return (
      <AppLayout title="Venda" showBack>
        <p className="text-center text-gray-500 py-12">Venda não encontrada.</p>
      </AppLayout>
    )
  }

  const customer = sale.customers
  const nextStatuses = SALE_STATUS_TRANSITIONS[sale.sale_status]
  const firstItem = sale.sale_items[0]

  const reservationMessage = customer
    ? `Olá, ${customer.name}! Sua camisa ${firstItem?.products?.team ?? ''} ${firstItem?.products?.size ?? ''}, está reservada até ${
        sale.reservation_deadline ? formatDateTime(sale.reservation_deadline) : '-'
      }. O valor total é ${formatCurrency(sale.total)}.`
    : ''

  const pendingMessage = customer
    ? `Olá, ${customer.name}! Identificamos um valor pendente de ${formatCurrency(
        sale.amount_pending
      )} referente ao seu pedido ${sale.code}. Se já realizou o pagamento, pode desconsiderar esta mensagem.`
    : ''

  const shippedMessage = customer
    ? `Olá, ${customer.name}! Seu pedido ${sale.code} foi enviado. O código de rastreio é ${sale.tracking_code ?? '-'}.`
    : ''

  const whatsappNumber = customer?.whatsapp ?? ''

  return (
    <AppLayout title={sale.code} showBack>
      <div className="flex flex-col gap-5 pb-10">
        {/* Header */}
        <Card className="p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${SALE_STATUS_STRIPE[sale.sale_status]}`} />
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xl font-bold text-gray-900 tracking-tight">{sale.code}</p>
              <p className="text-sm text-gray-500">{formatDateTime(sale.created_at)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge status={SALE_STATUS_BADGE[sale.sale_status]} className="text-[13px] px-3 py-1.5">
                {SALE_STATUS_LABELS[sale.sale_status]}
              </Badge>
              {sale.payment_status !== 'pago' && (
                <Badge status={PAYMENT_STATUS_BADGE[sale.payment_status]}>
                  {PAYMENT_STATUS_LABELS[sale.payment_status]}
                </Badge>
              )}
            </div>
          </div>

          {customer && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                {customer.whatsapp && <p className="text-sm text-gray-500">{formatPhone(customer.whatsapp)}</p>}
              </div>
              {customer.whatsapp && (
                <a
                  href={getWhatsAppLink(customer.whatsapp, '')}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  aria-label="Abrir WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.44 1.32 4.94L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.14h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.14.83.84-3.06-.2-.31a8.19 8.19 0 01-1.25-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.23-8.25 8.23z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {sale.tracking_code && (
            <p className="text-sm text-gray-600 border-t border-gray-100 pt-3">
              Rastreio: <strong className="text-gray-900">{sale.tracking_code}</strong>
            </p>
          )}
        </Card>

        {/* Items */}
        <Card className="p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Itens</h2>
          <div className="flex flex-col gap-3">
            {sale.sale_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                  {(item.products?.team ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.products?.team ?? 'Produto removido'}</p>
                  <p className="text-xs text-gray-500">
                    Tam. {item.products?.size ?? '-'} · {item.products?.sku ?? 'sem SKU'} · x{item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-gray-900 shrink-0">{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial summary */}
        <Card className="p-5 flex flex-col gap-1.5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Resumo Financeiro</h2>
          <Row label="Subtotal" value={formatCurrency(sale.sale_items.reduce((s, i) => s + i.unit_price * i.quantity, 0))} />
          <Row label="Desconto" value={`- ${formatCurrency(sale.discount)}`} />
          <Row label="Frete" value={`+ ${formatCurrency(sale.shipping)}`} />

          <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-2xl font-bold text-accent-600">{formatCurrency(sale.total)}</span>
          </div>

          <Row label="Pago" value={formatCurrency(sale.amount_paid)} />
          {sale.amount_pending > 0 ? (
            <div className="flex items-center justify-between bg-red-50 -mx-1 px-3 py-2 rounded-xl mt-1">
              <span className="text-sm font-semibold text-red-700">Pendente</span>
              <span className="text-base font-bold text-red-700">{formatCurrency(sale.amount_pending)}</span>
            </div>
          ) : (
            <Row label="Pendente" value={formatCurrency(0)} />
          )}
          {sale.due_date && <Row label="Vencimento" value={formatDate(sale.due_date)} />}
        </Card>

        {/* Actions */}
        <Card className="p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</h2>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowPaymentModal(true)}>
              Registrar Pagamento
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowTrackingModal(true)}>
              {sale.tracking_code ? 'Editar Rastreio' : 'Adicionar Rastreio'}
            </Button>
            <Link href={`/vendas/${sale.id}/editar`}>
              <Button size="sm" variant="secondary">Editar Venda</Button>
            </Link>
          </div>

          {nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {nextStatuses.map((status) => (
                <Button key={status} size="sm" variant="ghost" onClick={() => setConfirmStatus(status)}>
                  Marcar como {SALE_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir venda
            </button>
          </div>
        </Card>

        {/* Payment history */}
        <Card className="p-5 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Histórico de Pagamentos</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum pagamento registrado.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b last:border-b-0 border-gray-100 pb-2 last:pb-0">
                <div>
                  <p className="text-gray-900">{PAYMENT_METHOD_LABELS[p.method]}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(p.created_at)}</p>
                  {p.notes && <p className="text-xs text-gray-500">{p.notes}</p>}
                </div>
                <span className="font-semibold text-green-700">{formatCurrency(p.amount)}</span>
              </div>
            ))
          )}
        </Card>

        {/* Status history */}
        <Card className="p-5 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Histórico de Status</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">Sem histórico registrado.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex justify-between text-sm border-b last:border-b-0 border-gray-100 pb-2 last:pb-0">
                <span className="text-gray-700">
                  {h.previous_status ? `${SALE_STATUS_LABELS[h.previous_status]} → ` : ''}
                  {SALE_STATUS_LABELS[h.new_status]}
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(h.created_at)}</span>
              </div>
            ))
          )}
        </Card>

        {/* WhatsApp messages */}
        {customer && (
          <Card className="p-5 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mensagens de WhatsApp</h2>

            {sale.sale_status === 'reservada' && (
              <MessageBlock
                title="Reserva"
                text={reservationMessage}
                phone={whatsappNumber}
                onCopy={() => copyMessage(reservationMessage)}
              />
            )}

            {sale.amount_pending > 0 && (
              <MessageBlock
                title="Pagamento pendente"
                text={pendingMessage}
                phone={whatsappNumber}
                onCopy={() => copyMessage(pendingMessage)}
              />
            )}

            {sale.sale_status === 'enviada' && (
              <MessageBlock
                title="Pedido enviado"
                text={shippedMessage}
                phone={whatsappNumber}
                onCopy={() => copyMessage(shippedMessage)}
              />
            )}
          </Card>
        )}
      </div>

      {/* Status change confirm */}
      <ConfirmDialog
        open={Boolean(confirmStatus)}
        title={`Marcar como ${confirmStatus ? SALE_STATUS_LABELS[confirmStatus] : ''}`}
        description={confirmStatus ? SALE_STATUS_TRANSITION_MESSAGES[confirmStatus] : ''}
        danger={confirmStatus === 'cancelada'}
        loading={statusLoading}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmStatus(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir venda"
        description="Essa ação vai excluir a venda permanentemente e devolver os itens ao estoque. Não pode ser desfeita."
        danger
        loading={deleteLoading}
        onConfirm={handleDeleteSale}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Payment modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pagamento"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
            <Button onClick={handleRegisterPayment} loading={paymentLoading}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <CurrencyInput
            label="Valor"
            value={paymentAmount}
            onValueChange={(v) => setPaymentAmount(v)}
          />
          <Select label="Forma de pagamento" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Input label="Observações (opcional)" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
        </div>
      </Modal>

      {/* Tracking modal */}
      <Modal
        open={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        title="Código de Rastreio"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowTrackingModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveTracking} loading={trackingLoading}>Salvar</Button>
          </>
        }
      >
        <Input label="Código de rastreio" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
      </Modal>
    </AppLayout>
  )
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-bold text-gray-900 text-base pt-1 border-t border-gray-100' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className={highlight ? 'text-red-600 font-semibold' : 'text-gray-900'}>{value}</span>
    </div>
  )
}

function MessageBlock({
  title,
  text,
  phone,
  onCopy,
}: {
  title: string
  text: string
  phone: string
  onCopy: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{text}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onCopy}>
          Copiar
        </Button>
        {phone ? (
          <a
            href={getWhatsAppLink(phone, text)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Abrir no WhatsApp
          </a>
        ) : (
          <span className="text-xs text-gray-400 self-center">Cliente sem WhatsApp cadastrado</span>
        )}
      </div>
    </div>
  )
}
