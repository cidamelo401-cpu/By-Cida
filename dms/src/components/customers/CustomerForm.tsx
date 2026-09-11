'use client'
import { useState } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { formatPhone } from '@/lib/utils/format'
import type { ProductSize } from '@/types/database'

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const

const SIZES: ProductSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export type CustomerFormValues = {
  name: string
  whatsapp: string
  instagram: string
  city: string
  state: string
  favorite_team: string
  preferred_size: ProductSize | ''
  notes: string
}

type CustomerFormProps = {
  initialValues?: Partial<CustomerFormValues>
  onSubmit: (values: CustomerFormValues) => Promise<void>
  submitLabel?: string
}

const EMPTY_VALUES: CustomerFormValues = {
  name: '',
  whatsapp: '',
  instagram: '',
  city: '',
  state: '',
  favorite_team: '',
  preferred_size: '',
  notes: '',
}

function normalizeInstagram(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}

export function CustomerForm({ initialValues, onSubmit, submitLabel = 'Salvar' }: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>({ ...EMPTY_VALUES, ...initialValues })
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormValues, string>>>({})
  const [saving, setSaving] = useState(false)

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    setValues((v) => ({ ...v, whatsapp: digits }))
  }

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, instagram: e.target.value }))
  }

  const handleInstagramBlur = () => {
    setValues((v) => ({ ...v, instagram: normalizeInstagram(v.instagram) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof CustomerFormValues, string>> = {}
    if (!values.name.trim()) newErrors.name = 'Informe o nome do cliente'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      await onSubmit({ ...values, instagram: normalizeInstagram(values.instagram) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome *"
        placeholder="Nome do cliente"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        error={errors.name}
      />

      <Input
        label="WhatsApp"
        placeholder="(11) 91234-5678"
        inputMode="numeric"
        value={formatPhone(values.whatsapp)}
        onChange={handleWhatsappChange}
      />

      <Input
        label="Instagram"
        placeholder="@usuario"
        value={values.instagram}
        onChange={handleInstagramChange}
        onBlur={handleInstagramBlur}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cidade"
          placeholder="Cidade"
          value={values.city}
          onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
        />
        <Select
          label="Estado"
          value={values.state}
          onChange={(e) => setValues((v) => ({ ...v, state: e.target.value }))}
        >
          <option value="">-</option>
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Time favorito"
        placeholder="Ex: Flamengo"
        value={values.favorite_team}
        onChange={(e) => setValues((v) => ({ ...v, favorite_team: e.target.value }))}
      />

      <Select
        label="Tamanho mais utilizado"
        value={values.preferred_size}
        onChange={(e) => setValues((v) => ({ ...v, preferred_size: e.target.value as ProductSize | '' }))}
      >
        <option value="">-</option>
        {SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Select>

      <Textarea
        label="Observações"
        placeholder="Observações sobre o cliente"
        value={values.notes}
        onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
      />

      <Button type="submit" fullWidth loading={saving}>
        {submitLabel}
      </Button>
    </form>
  )
}
