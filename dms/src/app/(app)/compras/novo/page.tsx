'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { Button, CurrencyInput, Input, SearchInput, Select, Textarea } from '@/components/ui'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Supplier = Database['public']['Tables']['suppliers']['Row']

export default function NewPurchaseLotPage() {
  const supabase = createClient()
  const router = useRouter()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [supplierId, setSupplierId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productId, setProductId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('1')
  const [unitCost, setUnitCost] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: suppliersData, error: suppliersError }, { data: productsData, error: productsError }] =
          await Promise.all([
            supabase.from('suppliers').select('*').eq('archived', false).order('name'),
            supabase
              .from('products')
              .select('*')
              .eq('archived', false)
              .order('team'),
          ])
        if (suppliersError) throw suppliersError
        if (productsError) throw productsError
        setSuppliers(suppliersData ?? [])
        setProducts(productsData ?? [])
      } catch {
        toast.error('Erro ao carregar fornecedores e produtos.')
      } finally {
        setLoadingData(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return products.slice(0, 20)
    return products
      .filter((p) =>
        `${p.team} ${p.season} ${p.model} ${p.version} ${p.size} ${p.sku}`.toLowerCase().includes(term)
      )
      .slice(0, 20)
  }, [products, productSearch])

  const selectedProduct = products.find((p) => p.id === productId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(quantity, 10)
    if (!supplierId) {
      toast.error('Selecione o fornecedor.')
      return
    }
    if (!productId) {
      toast.error('Selecione a camisa comprada.')
      return
    }
    if (!qty || qty <= 0) {
      toast.error('Informe uma quantidade válida.')
      return
    }
    if (unitCost <= 0) {
      toast.error('Informe o custo unitário pago.')
      return
    }

    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('purchase_lots').insert({
        supplier_id: supplierId,
        product_id: productId,
        purchase_date: purchaseDate,
        quantity: qty,
        remaining_quantity: qty,
        unit_cost: unitCost,
        notes: notes.trim() || null,
        created_by: userData.user?.id ?? null,
      })
      if (error) throw error
      toast.success('Compra registrada! Estoque atualizado.')
      router.push('/compras')
    } catch {
      toast.error('Erro ao registrar compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Nova Compra" showBack />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg pb-20">
        <Select
          label="Fornecedor"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          disabled={loadingData}
          required
        >
          <option value="">Selecione...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Camisa comprada</label>
          {selectedProduct ? (
            <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-primary-200 bg-primary-50">
              <p className="text-sm font-medium text-primary-900">
                {selectedProduct.team} · {selectedProduct.season} · {selectedProduct.size}
              </p>
              <button
                type="button"
                onClick={() => setProductId('')}
                className="text-xs text-primary-700 underline shrink-0"
              >
                Trocar
              </button>
            </div>
          ) : (
            <>
              <SearchInput
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onClear={() => setProductSearch('')}
                placeholder="Buscar por time, temporada, tamanho..."
              />
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {loadingData ? (
                  <p className="p-3 text-sm text-gray-400">Carregando...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="p-3 text-sm text-gray-400">Nenhum produto encontrado.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProductId(p.id)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{p.team}</span>{' '}
                      <span className="text-gray-500">
                        · {p.season} · {p.model} · {p.size}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <Input
          label="Data da compra"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
        />

        <Input
          label="Quantidade comprada"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <CurrencyInput label="Custo unitário pago (por unidade)" value={unitCost} onValueChange={setUnitCost} />

        <Textarea
          label="Observações (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: condição de pagamento, frete..."
        />

        <Button type="submit" loading={saving} fullWidth>
          Registrar Compra
        </Button>
      </form>
    </>
  )
}
