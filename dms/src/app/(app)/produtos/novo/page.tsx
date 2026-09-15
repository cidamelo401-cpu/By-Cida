'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, CurrencyInput, Input, MultiPhotoUpload, Select, Textarea } from '@/components/ui'
import { generateSKU } from '@/lib/utils/format'
import { CATALOG_SIZE_LABELS, COMMON_TEAMS, MODEL_LABELS, SIZE_OPTIONS, VERSION_LABELS } from '@/lib/constants/products'
import type { ProductModel, ProductSize, ProductVersion } from '@/types/database'

type FormState = {
  team: string
  country_league: string
  season: string
  model: ProductModel
  version: ProductVersion
  size: ProductSize
  quantity: string
  cost_price: number // cents
  sell_price: number // cents
  supplier: string
  photo_url: string
  photos: string[]
  notes: string
  min_stock: string
  sob_encomenda: boolean
}

const initialState: FormState = {
  team: '',
  country_league: '',
  season: '',
  model: 'titular',
  version: 'torcedor',
  size: 'M',
  quantity: '1',
  cost_price: 0,
  sell_price: 0,
  supplier: '',
  photo_url: '',
  photos: [],
  notes: '',
  min_stock: '2',
  sob_encomenda: false,
}

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user, signOut, profile } = useAuth()

  const [form, setForm] = useState<FormState>(() => {
    if (!searchParams || Array.from(searchParams.keys()).length === 0) return initialState
    return {
      ...initialState,
      team: searchParams.get('team') ?? initialState.team,
      country_league: searchParams.get('country_league') ?? initialState.country_league,
      season: searchParams.get('season') ?? initialState.season,
      model: (searchParams.get('model') as ProductModel) ?? initialState.model,
      version: (searchParams.get('version') as ProductVersion) ?? initialState.version,
      size: (searchParams.get('size') as ProductSize) ?? initialState.size,
      cost_price: Number(searchParams.get('cost_price')) || initialState.cost_price,
      sell_price: Number(searchParams.get('sell_price')) || initialState.sell_price,
      supplier: searchParams.get('supplier') ?? initialState.supplier,
      photo_url: searchParams.get('photo_url') ?? initialState.photo_url,
      notes: searchParams.get('notes') ?? initialState.notes,
      min_stock: searchParams.get('min_stock') ?? initialState.min_stock,
      quantity: '0',
    }
  })
  const [saving, setSaving] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)

  const filteredTeams = useMemo(() => {
    const term = form.team.trim().toLowerCase()
    if (!term) return COMMON_TEAMS
    return COMMON_TEAMS.filter((t) => t.toLowerCase().includes(term))
  }, [form.team])

  const skuPreview = useMemo(
    () => generateSKU(form.team || 'TIME', form.season, form.model, form.version, form.size),
    [form.team, form.season, form.model, form.version, form.size]
  )

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): string | null {
    if (!form.team.trim()) return 'Informe o time.'
    const qty = Number(form.quantity)
    if (Number.isNaN(qty) || qty < 0) return 'Quantidade inválida.'
    if (form.sell_price <= 0) return 'Informe o preço de venda.'
    return null
  }

  async function handleSave(e: FormEvent, andNew: boolean) {
    e.preventDefault()
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    if (!user) {
      toast.error('Sessão expirada. Faça login novamente.')
      return
    }

    setSaving(true)
    try {
      const sku = generateSKU(form.team, form.season, form.model, form.version, form.size)
      const quantity = Number(form.quantity) || 0
      const minStock = Number(form.min_stock) || 0

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          team: form.team.trim(),
          country_league: form.country_league.trim() || null,
          season: form.season.trim() || null,
          model: form.model,
          version: form.version,
          size: form.size,
          quantity,
          cost_price: form.cost_price,
          sell_price: form.sell_price,
          supplier: form.supplier.trim() || null,
          photo_url: form.photos[0]?.trim() || form.photo_url.trim() || null,
          photos: form.photos.length > 0 ? form.photos : null,
          notes: form.notes.trim() || null,
          min_stock: minStock,
          status: form.sob_encomenda ? 'sob_encomenda' : quantity > 0 ? 'disponivel' : 'esgotado',
          sku,
          archived: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (quantity > 0 && product) {
        const { error: moveError } = await supabase.from('stock_movements').insert({
          product_id: product.id,
          type: 'entrada',
          quantity,
          previous_quantity: 0,
          new_quantity: quantity,
          reason: 'Cadastro inicial do produto',
          created_by: user.id,
        })
        if (moveError) throw moveError
      }

      toast.success('Camisa cadastrada com sucesso!')

      if (andNew) {
        setForm(initialState)
      } else {
        router.push('/produtos')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout
      title="Nova Camisa"
      showBack
      userName={profile?.full_name ?? undefined}
      userRole={profile?.role}
      onSignOut={signOut}
    >
      <form onSubmit={(e) => handleSave(e, false)} className="flex flex-col gap-5 max-w-2xl mx-auto pb-10">
        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Informações da camisa</h2>

          <div className="relative">
            <Input
              label="Time"
              value={form.team}
              onChange={(e) => updateField('team', e.target.value)}
              onFocus={() => setShowTeamSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTeamSuggestions(false), 150)}
              placeholder="Ex: Flamengo"
              required
            />
            {showTeamSuggestions && filteredTeams.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {filteredTeams.map((team) => (
                  <li key={team}>
                    <button
                      type="button"
                      onMouseDown={() => updateField('team', team)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-primary-50"
                    >
                      {team}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="País / Campeonato"
              value={form.country_league}
              onChange={(e) => updateField('country_league', e.target.value)}
              placeholder="Ex: Brasil / Série A"
            />
            <Input
              label="Temporada"
              value={form.season}
              onChange={(e) => updateField('season', e.target.value)}
              placeholder="Ex: 2025/2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Modelo"
              value={form.model}
              onChange={(e) => updateField('model', e.target.value as ProductModel)}
            >
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

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tamanho"
              value={form.size}
              onChange={(e) => updateField('size', e.target.value as ProductSize)}
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {CATALOG_SIZE_LABELS[size] ?? size}
                </option>
              ))}
            </Select>
            <Input
              label="Quantidade"
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
            />
          </div>

          <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
            <p className="text-xs font-medium text-primary-800 uppercase tracking-wide">SKU (gerado automaticamente)</p>
            <p className="mt-1 font-mono text-sm font-semibold text-primary-900">{skuPreview}</p>
          </div>
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
            placeholder="Ex: Fornecedor XPTO"
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
            placeholder="Detalhes adicionais sobre a camisa..."
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
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" loading={saving} fullWidth>
            Salvar
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={(e) => handleSave(e as unknown as FormEvent, true)}
          >
            Salvar e cadastrar outro
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}

