'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/ui'
import { CustomerForm, type CustomerFormValues } from '@/components/customers/CustomerForm'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

export default function EditCustomerPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function loadCustomer() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('customers').select('*').eq('id', params.id).single()
      if (error) throw error
      setCustomer(data)
    } catch {
      toast.error('Erro ao carregar cliente.')
      router.push('/clientes')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values: CustomerFormValues) {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: values.name.trim(),
          whatsapp: values.whatsapp || null,
          instagram: values.instagram || null,
          city: values.city || null,
          state: values.state || null,
          preferred_style: values.preferred_style || null,
          preferred_size: values.preferred_size || null,
          notes: values.notes || null,
        })
        .eq('id', params.id)

      if (error) throw error
      toast.success('Cliente atualizado com sucesso!')
      router.push(`/clientes/${params.id}`)
    } catch {
      toast.error('Erro ao atualizar cliente.')
    }
  }

  return (
    <AppLayout title="Editar Cliente" showBack>
      {loading || !customer ? (
        <LoadingSpinner label="Carregando cliente..." />
      ) : (
        <CustomerForm
          initialValues={{
            name: customer.name,
            whatsapp: customer.whatsapp ?? '',
            instagram: customer.instagram ?? '',
            city: customer.city ?? '',
            state: customer.state ?? '',
            preferred_style: customer.preferred_style ?? '',
            preferred_size: customer.preferred_size ?? '',
            notes: customer.notes ?? '',
          }}
          onSubmit={handleSubmit}
          submitLabel="Salvar Alterações"
        />
      )}
    </AppLayout>
  )
}
