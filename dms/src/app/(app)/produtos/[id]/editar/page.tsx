'use client'

import { useEffect, useState, use as usePromise, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, EmptyState, Input, LoadingSpinner, MultiPhotoUpload, Select, Textarea } from '@/components/ui'
import { formatCurrency, parseCurrency } from '@/lib/utils/format'
import { MODEL_LABELS, SIZE_OPTIONS, VERSION_LABELS } from '@/lib/constants/products'
import type { Database, ProductModel, ProductSize, ProductVersion } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const router = useRouter()
  const supabase = createClient()
  const { signOut, profile } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    min_stock: '2',
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
          min_stock: String(data.min_stock),
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!product) return
    if (!form.team.trim()) {
      toast.error('Informe o time.')
      return
    }
    if (form.sell_price <= 0) {
      toast.error('Informe o preço de venda.')
      return
    }

    setSaving(true)
    try {
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
          min_stock: Number(form.min_stock) || 0,
        })
        .eq('id', product.id)

      if (error) throw error

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
                {size}
              </option>
            ))}
          </Select>

          <Input label="SKU" value={product.sku ?? '—'} readOnly disabled className="font-mono bg-gray-50" />
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Preços e fornecedor</h2>
          <div className="grid grid-cols-2 gap-4">
            <CurrencyField
              label="Custo unitário"
              value={form.cost_price}
              onChange={(v) => updateField('cost_price', v)}
            />
            <CurrencyField
              label="Preço de venda"
              value={form.sell_price}
              onChange={(v) => updateField('sell_price', v)}
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
            label="Estoque mínimo"
            type="number"
            min={0}
            value={form.min_stock}
            onChange={(e) => updateField('min_stock', e.target.value)}
          />
          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
          <p className="text-xs text-gray-400">
            A quantidade em estoque é alterada apenas por movimentações, na página do produto.
          </p>
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
    </AppLayout>
  )
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const [raw, setRaw] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) {
      setRaw(value ? formatCurrency(value) : '')
    }
  }, [value, focused])

  return (
    <Input
      label={label}
      type="text"
      inputMode="decimal"
      className="currency"
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value)
        const parsed = parseCurrency(e.target.value)
        if (parsed !== value) onChange(parsed)
      }}
      onFocus={() => {
        setFocused(true)
        setRaw(value ? String(value).replace('.', ',') : '')
      }}
      onBlur={() => {
        setFocused(false)
        const parsed = parseCurrency(raw)
        onChange(parsed)
        setRaw(parsed ? formatCurrency(parsed) : '')
      }}
      placeholder="R$ 0,00"
    />
  )
}
