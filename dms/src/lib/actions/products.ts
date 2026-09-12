import { createClient } from '@/lib/supabase/client'
import type { StockMovementType } from '@/types/database'

export async function registerStockMovement(params: {
  product_id: string
  type: StockMovementType
  quantity: number // positive for additions, negative for removals
  reason?: string
  sale_id?: string
  created_by: string
}) {
  const supabase = createClient()

  // Get current product
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', params.product_id)
    .single()

  if (fetchError || !product) throw new Error('Produto não encontrado')

  const newQuantity = product.quantity + params.quantity
  if (newQuantity < 0) throw new Error('Estoque insuficiente')

  // Create movement
  const { error: moveError } = await supabase.from('stock_movements').insert({
    product_id: params.product_id,
    type: params.type,
    quantity: params.quantity,
    previous_quantity: product.quantity,
    new_quantity: newQuantity,
    reason: params.reason,
    sale_id: params.sale_id,
    created_by: params.created_by,
  })
  if (moveError) throw moveError

  // Update product quantity (and status if it hit zero or came back up)
  const status = newQuantity <= 0 ? 'esgotado' : undefined

  const { error: updateError } = await supabase
    .from('products')
    .update({
      quantity: newQuantity,
      ...(status ? { status } : {}),
    })
    .eq('id', params.product_id)
  if (updateError) throw updateError

  return { newQuantity }
}

export async function archiveProduct(productId: string, archived: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('products').update({ archived }).eq('id', productId)
  if (error) throw error
}

export async function deleteProduct(productId: string) {
  const supabase = createClient()
  // Delete stock movements first (FK constraint)
  const { error: movError } = await supabase
    .from('stock_movements')
    .delete()
    .eq('product_id', productId)
  if (movError) throw movError

  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw error
}
