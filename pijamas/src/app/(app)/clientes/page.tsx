'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, EmptyState, LoadingSpinner, SearchInput } from '@/components/ui'
import { formatPhone } from '@/lib/utils/format'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

function CustomerPlaceholder() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-3.13a4 4 0 100-8 4 4 0 000 8zm6 0a4 4 0 10-1.06-7.87"
      />
    </svg>
  )
}

export default function CustomersPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('customers').select('*').order('name')
      if (error) throw error
      setCustomers(data ?? [])
    } catch {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        (c.whatsapp ?? '').toLowerCase().includes(term) ||
        (c.instagram ?? '').toLowerCase().includes(term)
      )
    })
  }, [customers, search])

  return (
    <AppLayout title="Clientes">
      <div className="flex flex-col gap-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Buscar por nome, WhatsApp ou Instagram..."
        />

        {loading ? (
          <LoadingSpinner label="Carregando clientes..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CustomerPlaceholder />}
            title="Nenhum cliente encontrado"
            description={
              customers.length === 0
                ? 'Cadastre o primeiro cliente da sua base.'
                : 'Ajuste a busca para encontrar clientes.'
            }
            action={
              <Link
                href="/clientes/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                + Novo Cliente
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filtered.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/clientes/novo"
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-800 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Novo Cliente
      </Link>
    </AppLayout>
  )
}

function CustomerCard({ customer }: { customer: Customer }) {
  const location = [customer.city, customer.state].filter(Boolean).join(' - ')
  return (
    <Link href={`/clientes/${customer.id}`}>
      <Card className="p-4 h-full flex gap-3 items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
          <CustomerPlaceholder />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{customer.name}</p>
          {customer.whatsapp && (
            <p className="text-xs text-gray-500 mt-0.5">{formatPhone(customer.whatsapp)}</p>
          )}
          {customer.instagram && <p className="text-xs text-gray-500">{customer.instagram}</p>}
          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
            {location && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{location}</span>
            )}
            {customer.preferred_style && (
              <span className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-800 font-medium">
                {customer.preferred_style}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
