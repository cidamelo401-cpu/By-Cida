'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Input, Textarea } from '@/components/ui'

export default function NewSupplierPage() {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Informe o nome do fornecedor.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('suppliers').insert({
        name: name.trim(),
        contact: contact.trim() || null,
        notes: notes.trim() || null,
      })
      if (error) throw error
      toast.success('Fornecedor cadastrado com sucesso!')
      router.push('/fornecedores')
    } catch {
      toast.error('Erro ao cadastrar fornecedor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Novo Fornecedor" showBack>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg pb-20">
        <Input
          label="Nome do fornecedor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fábrica Dragão"
          required
        />
        <Input
          label="Contato (opcional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="WhatsApp, Instagram ou e-mail"
        />
        <Textarea
          label="Observações (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: prazo de entrega, condições de pagamento..."
        />
        <Button type="submit" loading={saving} fullWidth>
          Cadastrar Fornecedor
        </Button>
      </form>
    </AppLayout>
  )
}
