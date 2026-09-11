'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { CustomerForm, type CustomerFormValues } from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(values: CustomerFormValues) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: values.name.trim(),
          whatsapp: values.whatsapp || null,
          instagram: values.instagram || null,
          city: values.city || null,
          state: values.state || null,
          favorite_team: values.favorite_team || null,
          preferred_size: values.preferred_size || null,
          notes: values.notes || null,
        })
        .select('id')
        .single()

      if (error) throw error
      toast.success('Cliente cadastrado com sucesso!')
      router.push(`/clientes/${data.id}`)
    } catch {
      toast.error('Erro ao cadastrar cliente.')
    }
  }

  return (
    <AppLayout title="Novo Cliente" showBack>
      <CustomerForm onSubmit={handleSubmit} submitLabel="Cadastrar Cliente" />
    </AppLayout>
  )
}
