'use client'

import { useEffect, useState, use as usePromise, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, ConfirmDialog, CurrencyInput, EmptyState, Input, LoadingSpinner, MultiPhotoUpload, Select, Textarea } from '@/components/ui'
import { CATALOG_SIZE_LABELS, MODEL_LABELS, SIZE_OPTIONS, VERSION_LABELS } from '@/lib/constants/products'
import type { Database, ProductModel, ProductSize, ProductVersion } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const router = useRouter()
  const supabase = createClient()
  const { user, signOut, profile } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPriceReminder, setShowPriceReminder] = useState(false)

  const [form, setForm] = useState({
    team: '',
    country_league: '',
    season: '',
    model: 'titular' as ProductModel,
    version: 'torcedor' as ProductVersion,
    size: 'M' as ProductSize,
    cost_price: 0,
    sell_price: 0,
    supplier: '',
    photo_url: '',
    photos: [] as string[],
    notes: '',
    quantity: '0',
    sob_encomenda: false,
    is_cover: false,
    nova_camisa: false,
  })

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
        if (error) throw error
        setProduct(data)
        setForm({
          team: data.team,
          country_league: data.country_league ?? '',
          season: data.season ?? '',
          model: data.model,
          version: data.version,
          size: data.size,
          cost_price: data.cost_price,
          sell_price: data.sell_price,
          supplier: data.supplier ?? '',
          photo_url: data.photo_url ?? '',
          photos: (data as any).photos?.length ? (data as any).photos : (data.photo_url ? [data.photo_url] : []),
          notes: data.notes ?? '',
          quantity: String(data.quantity),
          sob_encomenda: data.status === 'sob_encomenda',
          is_cover: !!(data as any).is_cover,
          nova_camisa: !!(data as any).catalog_group,
        })
      } catch {
        toast.error('Erro ao carregar produto.')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Camisa está saindo de "sob encomenda" (sem estoque) para "com estoque",
  // mas ainda com o preço zerado — precisa lembrar de preencher antes de salvar.
  function isRestockingWithoutPrice() {
    if (!product) return false
    const newQuantity = Number(form.quantity) || 0
    return (
      product.status === 'sob_encomenda' &&
      product.quantity <= 0 &&
      newQuantity > 0 &&
      form.sob_encomenda &&
      form.sell_price <= 0
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!product) return
    if (!form.team.trim()) {
      toast.error('Informe o time.')
      return
    }
    if (!form.sob_encomenda && form.sell_price <= 0) {
      toast.error('Informe o preço de venda.')
      return
    }
    if (isRestockingWithoutPrice()) {
      setShowPriceReminder(true)
      return
    }

    await doSave()
  }

  async function doSave() {
    if (!product) return
    setSaving(true)
    try {
      const newQuantity = Number(form.quantity) || 0
      const prevQuantity = product.quantity

      const newStatus = form.sob_encomenda
        ? 'sob_encomenda'
        : newQuantity > 0
          ? 'disponivel'
          : 'esgotado'

      const hadGroup = !!(product as any).catalog_group
      const catalogGroup = form.nova_camisa
        ? (hadGroup ? (product as any).catalog_group : crypto.randomUUID())
        : null

      const { error } = await supabase
        .from('products')
        .update({
          team: form.team.trim(),
          country_league: form.country_league.trim() || null,
          season: form.season.trim() || null,
          model: form.model,
          version: form.version,
          size: form.size,
          cost_price: form.cost_price,
          sell_price: form.sell_price,
          supplier: form.supplier.trim() || null,
          photo_url: form.photos[0]?.trim() || form.photo_url.trim() || null,
          photos: form.photos.length > 0 ? form.photos : null,
          notes: form.notes.trim() || null,
          quantity: newQuantity,
          status: newStatus,
          is_cover: form.is_cover,
          catalog_group: catalogGroup,
        })
        .eq('id', product.id)

      if (error) throw error

      // Registrar movimentação de estoque se a quantidade mudou
      if (newQuantity !== prevQuantity && user) {
        const diff = newQuantity - prevQuantity
        await supabase.from('stock_movements').insert({
          product_id: product.id,
          type: 'ajuste',
          quantity: Math.abs(diff),
          previous_quantity: prevQuantity,
          new_quantity: newQuantity,
          reason: 'Ajuste manual via edição do produto',
          created_by: user.id,
        })
      }

      toast.success('Produto atualizado com sucesso!')
      router.push(`/produtos/${product.id}`)
    } catch {
      toast.error('Erro ao atualizar produto.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Editar Camisa" showBack userName={profile?.full_name ?? undefined} userRole={profile?.role} onSignOut={signOut}>
        <LoadingSpinner label="Carregando produto..." />
      </AppLayout>
    )
  }

  if (!product) {
    return (
      <AppLayout title="Editar Camisa" showBack userName={profile?.full_name ?? undefined} userRole={profile?.role} onSignOut={signOut}>
        <EmptyState title="Produto não encontrado" description="Este produto pode ter sido removido." />
      </AppLayout>
    )
  }

  if (product.archived) {
    return (
      <AppLayout title="Editar Camisa" showBack userName={profile?.full_name ?? undefined} userRole={profile?.role} onSignOut={signOut}>
        <EmptyState
          title="Produto arquivado"
          description="Reative o produto antes de editá-lo."
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Editar Camisa"
      showBack
      userName={profile?.full_name ?? undefined}
      userRole={profile?.role}
      onSignOut={signOut}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl mx-auto pb-10">
        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Informações da camisa</h2>

          <Input
            label="Time"
            value={form.team}
            onChange={(e) => updateField('team', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="País / Campeonato"
              value={form.country_league}
              onChange={(e) => updateField('country_league', e.target.value)}
            />
            <Input
              label="Temporada"
              value={form.season}
              onChange={(e) => updateField('season', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Modelo" value={form.model} onChange={(e) => updateField('model', e.target.value as ProductModel)}>
              {Object.entries(MODEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="Versão"
              value={form.version}
              onChange={(e) => updateField('version', e.target.value as ProductVersion)}
            >
              {Object.entries(VERSION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <Select label="Tamanho" value={form.size} onChange={(e) => updateField('size', e.target.value as ProductSize)}>
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {CATALOG_SIZE_LABELS[size] ?? size}
              </option>
            ))}
          </Select>

          <Input label="SKU" value={product.sku ?? '—'} readOnly disabled className="font-mono bg-gray-50" />
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Preços e fornecedor</h2>
          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Custo unitário"
              value={form.cost_price}
              onValueChange={(v) => updateField('cost_price', v)}
            />
            <CurrencyInput
              label="Preço de venda"
              value={form.sell_price}
              onValueChange={(v) => updateField('sell_price', v)}
            />
          </div>
          <Input
            label="Fornecedor"
            value={form.supplier}
            onChange={(e) => updateField('supplier', e.target.value)}
          />
          <MultiPhotoUpload
            photos={form.photos}
            onChange={(photos) => {
              updateField('photos', photos)
              updateField('photo_url', photos[0] ?? '')
            }}
            disabled={saving}
          />
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Estoque e observações</h2>
          <Input
            label="Quantidade em estoque"
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => updateField('quantity', e.target.value)}
          />
          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sob_encomenda}
              onChange={(e) => updateField('sob_encomenda', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Sob Encomenda</span>
            <span className="text-xs text-gray-400">(não disponível a pronta entrega)</span>
          </label>

          {form.sob_encomenda && Number(form.quantity) > 0 && form.sell_price <= 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex gap-2">
              <span className="text-amber-600">⚠️</span>
              <p className="text-xs text-amber-800">
                Essa camisa já tem estoque, mas continua <strong>Sob Encomenda</strong> porque o preço de venda está em R$ 0,00.
                Preencha o preço e desmarque "Sob Encomenda" para ela aparecer disponível no catálogo.
              </p>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_cover}
              onChange={(e) => updateField('is_cover', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">Capa do catálogo</span>
            <span className="text-xs text-gray-400">(foto usada no card do catálogo)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.nova_camisa}
              onChange={(e) => updateField('nova_camisa', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Nova camisa</span>
            <span className="text-xs text-gray-400">(criar card separado no catálogo)</span>
          </label>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" loading={saving} fullWidth>
            Salvar alterações
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={() => router.push(`/produtos/${product.id}`)}>
            Cancelar
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={showPriceReminder}
        title="Falta o preço de venda"
        description={`Essa camisa estava "Sob Encomenda" e agora tem estoque, mas o preço de venda ainda está em R$ 0,00. Se salvar assim, ela vai continuar Sob Encomenda até alguém preencher o preço. Quer voltar e preencher o preço agora?`}
        confirmLabel="Salvar sob encomenda mesmo assim"
        cancelLabel="Voltar e preencher o preço"
        loading={saving}
        onConfirm={async () => {
          setShowPriceReminder(false)
          await doSave()
        }}
        onCancel={() => setShowPriceReminder(false)}
      />
    </AppLayout>
  )
}

