'use client'

import { useEffect, useState, use as usePromise } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, CurrencyInput, Input, LoadingSpinner, Textarea } from '@/components/ui'
import { updateSaleDetails } from '@/lib/actions/sales'
import type { Database } from '@/types/database'

type Sale = Database['public']['Tables']['sales']['Row']

export default function EditarVendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const supabase = createClient()
  const router = useRouter()

  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [notes, setNotes] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [dueDate, setDueDate] = useState('')

  async function loadSale() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('sales').select('*').eq('id', id).single()
      if (error || !data) throw error
      setSale(data)
      setDiscount(data.discount)
      setShipping(data.shipping)
      setNotes(data.notes ?? '')
      setTrackingCode(data.tracking_code ?? '')
      setDueDate(data.due_date ? data.due_date.slice(0, 10) : '')
    } catch {
      toast.error('Erro ao carregar venda.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSale()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSave() {
    if (!sale) return
    setSaving(true)
    try {
      await updateSaleDetails(sale.id, {
        discount,
        shipping,
        notes: notes || null,
        tracking_code: trackingCode || null,
        due_date: dueDate || null,
      })
      toast.success('Venda atualizada!')
      router.push(`/vendas/${sale.id}`)
    } catch {
      toast.error('Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Editar Venda" showBack>
        <LoadingSpinner label="Carregando..." />
      </AppLayout>
    )
  }

  if (!sale) {
    return (
      <AppLayout title="Editar Venda" showBack>
        <p className="text-center text-gray-500 py-12">Venda não encontrada.</p>
      </AppLayout>
    )
  }

  const itemsLocked = sale.sale_status !== 'orcamento'

  return (
    <AppLayout title={`Editar ${sale.code}`} showBack>
      <div className="flex flex-col gap-5 pb-10">
        <Card className="p-4 flex flex-col gap-4">
          {itemsLocked && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Os itens da venda não podem mais ser alterados pois o status já avançou além de orçamento.
            </p>
          )}

          <div className="flex gap-2">
            <CurrencyInput
              label="Desconto (R$)"
              value={discount}
              onValueChange={setDiscount}
            />
            <CurrencyInput
              label="Frete (R$)"
              value={shipping}
              onValueChange={setShipping}
            />
          </div>

          <Input label="Código de rastreio" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />

          <Input label="Data de vencimento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <Textarea label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => router.push(`/vendas/${sale.id}`)}>
            Cancelar
          </Button>
          <Button fullWidth onClick={handleSave} loading={saving}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
