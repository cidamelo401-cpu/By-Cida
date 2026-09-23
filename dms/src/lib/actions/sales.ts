import { createClient } from '@/lib/supabase/client'
import type { Database, PaymentMethod, SaleChannel, SaleStatus } from '@/types/database'

export async function createSale(params: {
  customer_id: string
  channel: SaleChannel
  items: Array<{ product_id: string; quantity: number; unit_price: number; cost_price: number }>
  discount: number
  shipping: number
  payment_method?: PaymentMethod
  amount_paid: number
  due_date?: string
  notes?: string
  sale_status: SaleStatus
  reservation_deadline?: string
  created_by: string
}) {
  const supabase = createClient()
  const subtotal = params.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const total = subtotal - params.discount + params.shipping

  // Insert sale
  const { data: sale, error } = await supabase
    .from('sales')
    .insert({
      customer_id: params.customer_id,
      channel: params.channel,
      discount: params.discount,
      shipping: params.shipping,
      total,
      amount_paid: params.amount_paid,
      payment_method: params.payment_method,
      sale_status: params.sale_status,
      due_date: params.due_date || null,
      notes: params.notes || null,
      reservation_deadline: params.reservation_deadline || null,
      created_by: params.created_by,
    })
    .select()
    .single()

  if (error || !sale) throw error || new Error('Erro ao criar venda')

  // Insert items
  const itemsToInsert = params.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    cost_price: item.cost_price,
  }))
  const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert)
  if (itemsError) throw itemsError

  // Deduct stock for each item and register stock movement
  for (const item of params.items) {
    const { data: product } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', item.product_id)
      .single()

    if (product) {
      const newQty = Math.max(0, product.quantity - item.quantity)
      await supabase
        .from('products')
        .update({
          quantity: newQty,
          status: newQty > 0 ? 'disponivel' : 'sob_encomenda',
        })
        .eq('id', item.product_id)

      await supabase.from('stock_movements').insert({
        product_id: item.product_id,
        type: 'venda',
        quantity: -item.quantity,
        previous_quantity: product.quantity,
        new_quantity: newQty,
        reason: `Venda ${sale.code}`,
        created_by: params.created_by,
      })
    }
  }

  // Create payment if amount > 0
  if (params.amount_paid > 0) {
    await supabase.from('payments').insert({
      sale_id: sale.id,
      amount: params.amount_paid,
      method: params.payment_method ?? 'outro',
      created_by: params.created_by,
    })
  }

  return sale
}

export async function deleteSale(saleId: string) {
  const supabase = createClient()

  // Restore stock for each item before deleting
  const { data: items } = await supabase
    .from('sale_items')
    .select('product_id, quantity')
    .eq('sale_id', saleId)

  if (items) {
    for (const item of items) {
      if (!item.product_id) continue
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const newQty = product.quantity + item.quantity
        await supabase
          .from('products')
          .update({ quantity: newQty, status: 'disponivel' })
          .eq('id', item.product_id)

        await supabase.from('stock_movements').insert({
          product_id: item.product_id,
          type: 'ajuste',
          quantity: item.quantity,
          previous_quantity: product.quantity,
          new_quantity: newQty,
          reason: 'Venda excluída',
        })
      }
    }
  }

  const { error } = await supabase.from('sales').delete().eq('id', saleId)
  if (error) throw error
}

export async function updateSaleStatus(saleId: string, newStatus: SaleStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from('sales')
    .update({ sale_status: newStatus })
    .eq('id', saleId)
  if (error) throw error
}

export async function registerPayment(params: {
  sale_id: string
  amount: number
  method: PaymentMethod
  notes?: string
  created_by: string
}) {
  const supabase = createClient()

  // Get current sale
  const { data: sale } = await supabase
    .from('sales')
    .select('amount_paid, total')
    .eq('id', params.sale_id)
    .single()
  if (!sale) throw new Error('Venda não encontrada')

  // Insert payment
  const { error: payError } = await supabase.from('payments').insert({
    sale_id: params.sale_id,
    amount: params.amount,
    method: params.method,
    notes: params.notes || null,
    created_by: params.created_by,
  })
  if (payError) throw payError

  // Update sale amount_paid
  const newAmountPaid = (sale.amount_paid || 0) + params.amount
  const { error: updateError } = await supabase
    .from('sales')
    .update({
      amount_paid: newAmountPaid,
      payment_method: params.method,
    })
    .eq('id', params.sale_id)
  if (updateError) throw updateError
}

export async function updateSaleDetails(
  saleId: string,
  params: {
    discount?: number
    shipping?: number
    notes?: string | null
    tracking_code?: string | null
    due_date?: string | null
  }
) {
  const supabase = createClient()

  // Recalculate total if discount/shipping changed
  const updates: Partial<Database['public']['Tables']['sales']['Update']> = { ...params }

  if (params.discount !== undefined || params.shipping !== undefined) {
    const { data: sale } = await supabase
      .from('sales')
      .select('discount, shipping')
      .eq('id', saleId)
      .single()

    const { data: items } = await supabase
      .from('sale_items')
      .select('quantity, unit_price')
      .eq('sale_id', saleId)

    if (sale && items) {
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      )
      const discount = params.discount ?? sale.discount
      const shipping = params.shipping ?? sale.shipping
      updates.total = subtotal - discount + shipping
    }
  }

  const { error } = await supabase.from('sales').update(updates).eq('id', saleId)
  if (error) throw error
}
