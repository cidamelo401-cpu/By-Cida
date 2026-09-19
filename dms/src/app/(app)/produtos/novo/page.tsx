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

type SizeEntry = { size: ProductSize; quantity: string }

type FormState = {
  team: string
  country_league: string
  season: string
  model: ProductModel
  version: ProductVersion
  cost_price: number
  sell_price: number
  supplier: string
  photo_url: string
  photos: string[]
  notes: string
  sob_encomenda: boolean
  sizes: SizeEntry[]
}

const initialState: FormState = {
  team: '',
  country_league: '',
  season: '',
  model: 'titular',
  version: 'torcedor',
  cost_price: 0,
  sell_price: 0,
  supplier: '',
  photo_url: '',
  photos: [],
  notes: '',
  sob_encomenda: false,
  sizes: [{ size: 'M', quantity: '1' }],
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
      cost_price: Number(searchParams.get('cost_price')) || initialState.cost_price,
      sell_price: Number(searchParams.get('sell_price')) || initialState.sell_price,
      supplier: searchParams.get('supplier') ?? initialState.supplier,
      photo_url: searchParams.get('photo_url') ?? initialState.photo_url,
      notes: searchParams.get('notes') ?? initialState.notes,
      sizes: searchParams.get('size')
        ? [{ size: searchParams.get('size') as ProductSize, quantity: '0' }]
        : initialState.sizes,
    }
  })
  const [saving, setSaving] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)

  const filteredTeams = useMemo(() => {
    const term = form.team.trim().toLowerCase()
    if (!term) return COMMON_TEAMS
    return COMMON_TEAMS.filter((t) => t.toLowerCase().includes(term))
  }, [form.team])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSize(index: number, field: keyof SizeEntry, value: string) {
    setForm((prev) => {
      const sizes = [...prev.sizes]
      sizes[index] = { ...sizes[index], [field]: value }
      return { ...prev, sizes }
    })
  }

  function addSize() {
    const usedSizes = form.sizes.map((s) => s.size)
    const nextSize = SIZE_OPTIONS.find((s) => !usedSizes.includes(s)) ?? 'M'
    setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { size: nextSize as ProductSize, quantity: '1' }] }))
  }

  function removeSize(index: number) {
    if (form.sizes.length <= 1) return
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))
  }

  function validate(): string | null {
    if (!form.team.trim()) return 'Informe o time.'
    if (!form.sob_encomenda && form.sell_price <= 0) return 'Informe o preço de venda.'
    for (const entry of form.sizes) {
      const qty = Number(entry.quantity)
      if (Number.isNaN(qty) || qty < 0) return `Quantidade inválida para tamanho ${CATALOG_SIZE_LABELS[entry.size] ?? entry.size}.`
    }
    const sizeValues = form.sizes.map((s) => s.size)
    if (new Set(sizeValues).size !== sizeValues.length) return 'Não repita tamanhos. Remova os duplicados.'
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
      const catalogGroup = crypto.randomUUID()
      const entries = form.sob_encomenda
        ? [{ size: 'AD' as ProductSize, quantity: 0 }]
        : form.sizes.map((s) => ({ size: s.size, quantity: Number(s.quantity) || 0 }))

      const products = entries.map((entry) => ({
        team: form.team.trim(),
        country_league: form.country_league.trim() || null,
        season: form.season.trim() || null,
        model: form.model,
        version: form.version,
        size: entry.size,
        quantity: entry.quantity,
        cost_price: form.cost_price,
        sell_price: form.sell_price,
        supplier: form.supplier.trim() || null,
        photo_url: form.photos[0]?.trim() || form.photo_url.trim() || null,
        photos: form.photos.length > 0 ? form.photos : null,
        notes: form.notes.trim() || null,
        min_stock: 0,
        status: (form.sob_encomenda ? 'sob_encomenda' : entry.quantity > 0 ? 'disponivel' : 'esgotado') as 'disponivel' | 'esgotado' | 'sob_encomenda',
        sku: generateSKU(form.team, form.season, form.model, form.version, entry.size),
        archived: false,
        catalog_group: entries.length > 1 ? catalogGroup : null,
      }))

      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(products)
        .select()

      if (insertError) throw insertError

      const movements = (inserted ?? [])
        .filter((p) => p.quantity > 0)
        .map((p) => ({
          product_id: p.id,
          type: 'entrada' as const,
          quantity: p.quantity,
          previous_quantity: 0,
          new_quantity: p.quantity,
          reason: 'Cadastro inicial do produto',
          created_by: user.id,
        }))

      if (movements.length > 0) {
        const { error: moveError } = await supabase.from('stock_movements').insert(movements)
        if (moveError) throw moveError
      }

      const total = entries.reduce((sum, e) => sum + e.quantity, 0)
      const sizeCount = entries.length
      toast.success(
        sizeCount > 1
          ? `${sizeCount} tamanhos cadastrados (${total} un. no total)`
          : 'Camisa cadastrada com sucesso!'
      )

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
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Tamanhos e quantidades</h2>
          {form.sob_encomenda ? (
            <p className="text-sm text-gray-500">Sob encomenda — tamanho definido na hora do pedido.</p>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {form.sizes.map((entry, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Select
                        label={index === 0 ? 'Tamanho' : undefined}
                        value={entry.size}
                        onChange={(e) => updateSize(index, 'size', e.target.value)}
                      >
                        {SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {CATALOG_SIZE_LABELS[size] ?? size}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        label={index === 0 ? 'Qtd' : undefined}
                        type="number"
                        min={0}
                        value={entry.quantity}
                        onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                      />
                    </div>
                    {form.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="mb-0.5 p-2 text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remover tamanho"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {form.sizes.length < SIZE_OPTIONS.length && (
                <button
                  type="button"
                  onClick={addSize}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar tamanho
                </button>
              )}
            </>
          )}
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
          <h2 className="font-semibold text-gray-900">Observações</h2>
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
              onChange={(e) => {
                updateField('sob_encomenda', e.target.checked)
              }}
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
