'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, CurrencyInput, Input, Modal, SearchInput, Select, Textarea } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/format'
import { createSale } from '@/lib/actions/sales'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants/sales'
import type { Database, PaymentMethod, SaleChannel, SaleStatus } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type Product = Database['public']['Tables']['products']['Row']

type SaleItem = {
  product_id: string
  team: string
  size: string
  sku: string | null
  available: number
  quantity: number
  unit_price: number
  cost_price: number
}

const STEPS = ['Cliente', 'Produtos', 'Valores', 'Revisão']

export default function NovaVendaPage() {
  const supabase = createClient()
  const router = useRouter()
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 1
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [channel, setChannel] = useState<SaleChannel>('whatsapp')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerWhatsapp, setNewCustomerWhatsapp] = useState('')
  const [creatingCustomer, setCreatingCustomer] = useState(false)

  // Step 2
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [items, setItems] = useState<SaleItem[]>([])

  // Step 3
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [amountPaid, setAmountPaid] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Step 4
  const [saleStatus, setSaleStatus] = useState<SaleStatus>('paga')
  const [reservationDate, setReservationDate] = useState('')
  const [reservationTime, setReservationTime] = useState('')

  async function loadCustomers() {
    const { data } = await supabase.from('customers').select('*').order('name')
    setCustomers(data ?? [])
  }

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('archived', false)
      .gt('quantity', 0)
      .order('team')
    setProducts(data ?? [])
  }

  useEffect(() => {
    loadCustomers()
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedCustomer = customers.find((c) => c.id === customerId)

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((c) => c.name.toLowerCase().includes(term))
  }, [customers, customerSearch])

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    const usedIds = new Set(items.map((i) => i.product_id))
    return products.filter((p) => {
      if (usedIds.has(p.id)) return false
      if (!term) return true
      return p.team.toLowerCase().includes(term) || (p.sku ?? '').toLowerCase().includes(term)
    })
  }, [products, productSearch, items])

  async function handleCreateCustomer() {
    if (!newCustomerName.trim()) {
      toast.error('Informe o nome do cliente.')
      return
    }
    setCreatingCustomer(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({ name: newCustomerName.trim(), whatsapp: newCustomerWhatsapp || null })
        .select()
        .single()
      if (error || !data) throw error
      setCustomers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setCustomerId(data.id)
      setShowNewCustomer(false)
      setNewCustomerName('')
      setNewCustomerWhatsapp('')
      toast.success('Cliente cadastrado!')
    } catch {
      toast.error('Erro ao cadastrar cliente.')
    } finally {
      setCreatingCustomer(false)
    }
  }

  function addProduct(product: Product) {
    setItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        team: product.team,
        size: product.size,
        sku: product.sku,
        available: product.quantity,
        quantity: 1,
        unit_price: product.sell_price,
        cost_price: product.cost_price,
      },
    ])
    setShowProductPicker(false)
    setProductSearch('')
  }

  function updateItem(productId: string, patch: Partial<SaleItem>) {
    setItems((prev) => prev.map((i) => (i.product_id === productId ? { ...i, ...patch } : i)))
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const total = Math.max(0, subtotal - discount + shipping)
  const totalCost = items.reduce((sum, i) => sum + i.cost_price * i.quantity, 0)
  const estimatedProfit = subtotal - discount - totalCost

  function canGoNext() {
    if (step === 0) return Boolean(customerId)
    if (step === 1) return items.length > 0 && items.every((i) => i.quantity > 0 && i.quantity <= i.available)
    return true
  }

  function nextStep() {
    if (!canGoNext()) {
      if (step === 0) toast.error('Selecione um cliente.')
      if (step === 1) toast.error('Adicione ao menos um produto com quantidade válida.')
      return
    }
    const next = Math.min(step + 1, STEPS.length - 1)
    if (next === 2 && amountPaid === 0) {
      setAmountPaid(total)
    }
    setStep(next)
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    if (!user) {
      toast.error('Usuário não autenticado.')
      return
    }
    if (saleStatus === 'reservada' && (!reservationDate || !reservationTime)) {
      toast.error('Informe a data e hora limite da reserva.')
      return
    }
    setSubmitting(true)
    try {
      const reservation_deadline =
        saleStatus === 'reservada' ? new Date(`${reservationDate}T${reservationTime}`).toISOString() : undefined

      const sale = await createSale({
        customer_id: customerId,
        channel,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          cost_price: i.cost_price,
        })),
        discount,
        shipping,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        due_date: dueDate || undefined,
        notes: notes || undefined,
        sale_status: saleStatus,
        reservation_deadline,
        created_by: user.id,
      })
      toast.success('Venda registrada com sucesso!')
      router.push(`/vendas/${sale.id}`)
    } catch {
      toast.error('Erro ao registrar a venda.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout title="Nova Venda" showBack>
      <div className="flex flex-col gap-6 pb-24">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    idx < step
                      ? 'bg-primary-900 text-white'
                      : idx === step
                      ? 'bg-primary-100 text-primary-900 border-2 border-primary-900'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx < step ? '✓' : idx + 1}
                </div>
                <span className={`text-[11px] font-medium ${idx === step ? 'text-primary-900' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${idx < step ? 'bg-primary-900' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Cliente e Canal */}
        {step === 0 && (
          <Card className="p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Cliente e Canal</h2>

            <SearchInput
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              onClear={() => setCustomerSearch('')}
              placeholder="Buscar cliente..."
            />

            <div className="max-h-64 overflow-y-auto flex flex-col gap-2 -mx-1 px-1">
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-gray-500 py-2">Nenhum cliente encontrado.</p>
              )}
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCustomerId(c.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                    customerId === c.id
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{c.name}</p>
                  {c.whatsapp && <p className="text-xs text-gray-500">{c.whatsapp}</p>}
                </button>
              ))}
            </div>

            <Button variant="ghost" onClick={() => setShowNewCustomer(true)}>
              + Cadastrar novo cliente
            </Button>

            {selectedCustomer && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Cliente selecionado: <strong className="text-gray-900">{selectedCustomer.name}</strong></p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canal da venda</label>
                <div className="flex gap-2">
                  {(['whatsapp', 'instagram'] as SaleChannel[]).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium capitalize ${
                        channel === ch
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Produtos */}
        {step === 1 && (
          <Card className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Produtos</h2>
              <Button size="sm" onClick={() => setShowProductPicker(true)}>
                + Adicionar
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhum produto adicionado ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.product_id} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.team}</p>
                        <p className="text-xs text-gray-500">
                          Tam. {item.size} · {item.sku ?? 'sem SKU'} · disponível: {item.available}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remover"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        label="Quantidade"
                        type="number"
                        min={1}
                        max={item.available}
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = Math.min(Math.max(1, Number(e.target.value) || 1), item.available)
                          updateItem(item.product_id, { quantity: qty })
                        }}
                      />
                      <CurrencyInput
                        label="Preço unitário"
                        value={item.unit_price}
                        onValueChange={(v) => updateItem(item.product_id, { unit_price: v })}
                      />
                    </div>
                    {item.quantity > item.available && (
                      <p className="text-xs text-red-600">Quantidade maior que o estoque disponível.</p>
                    )}
                    <p className="text-sm font-semibold text-primary-900 text-right">
                      Subtotal: {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <p className="text-right font-bold text-gray-900">Total dos itens: {formatCurrency(subtotal)}</p>
            )}
          </Card>
        )}

        {/* Step 3: Valores e Pagamento */}
        {step === 2 && (
          <Card className="p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Valores e Pagamento</h2>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>

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

            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <Select
              label="Forma de pagamento"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <CurrencyInput
              label="Valor pago"
              helper="Pode ser 0, parcial ou o valor total."
              value={amountPaid}
              onValueChange={setAmountPaid}
            />

            <Input
              label="Data de vencimento (opcional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Textarea label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Lucro estimado</span>
              <span className={`font-semibold ${estimatedProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatCurrency(estimatedProfit)}
              </span>
            </div>
          </Card>
        )}

        {/* Step 4: Revisão */}
        {step === 3 && (
          <Card className="p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Revisão e Confirmação</h2>

            <div className="flex flex-col gap-1 text-sm">
              <p><span className="text-gray-500">Cliente:</span> <strong>{selectedCustomer?.name}</strong></p>
              <p><span className="text-gray-500">Canal:</span> <strong className="capitalize">{channel}</strong></p>
            </div>

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>{item.team} ({item.size}) x{item.quantity}</span>
                  <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>
              <div className="flex justify-between"><span>Frete</span><span>+ {formatCurrency(shipping)}</span></div>
              <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>{formatCurrency(total)}</span></div>
              <div className="flex justify-between"><span>Pago</span><span>{formatCurrency(amountPaid)}</span></div>
              <div className="flex justify-between"><span>Pendente</span><span>{formatCurrency(Math.max(0, total - amountPaid))}</span></div>
            </div>

            <Select label="Status inicial" value={saleStatus} onChange={(e) => setSaleStatus(e.target.value as SaleStatus)}>
              <option value="paga">Paga</option>
              <option value="reservada">Reservada</option>
              <option value="aguardando_pagamento">Aguardando Pagamento</option>
            </Select>

            {saleStatus === 'reservada' && (
              <div className="flex gap-2">
                <Input
                  label="Data limite da reserva"
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                />
                <Input
                  label="Hora limite"
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                />
              </div>
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={prevStep} fullWidth>
              Voltar
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep} fullWidth>
              Continuar
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} fullWidth>
              Confirmar Venda
            </Button>
          )}
        </div>
      </div>

      {/* New customer modal */}
      <Modal
        open={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        title="Novo Cliente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewCustomer(false)}>Cancelar</Button>
            <Button onClick={handleCreateCustomer} loading={creatingCustomer}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input label="Nome" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
          <Input label="WhatsApp" value={newCustomerWhatsapp} onChange={(e) => setNewCustomerWhatsapp(e.target.value)} />
        </div>
      </Modal>

      {/* Product picker modal */}
      <Modal
        open={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        title="Adicionar Produto"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <SearchInput
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            onClear={() => setProductSearch('')}
            placeholder="Buscar por time ou SKU..."
          />
          <div className="max-h-96 overflow-y-auto flex flex-col gap-2">
            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhum produto disponível encontrado.</p>
            )}
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p)}
                className="text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-300 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.team}</p>
                  <p className="text-xs text-gray-500">
                    Tam. {p.size} · {p.sku ?? 'sem SKU'} · disponível: {p.quantity}
                  </p>
                </div>
                <span className="font-semibold text-primary-900 shrink-0">{formatCurrency(p.sell_price)}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
