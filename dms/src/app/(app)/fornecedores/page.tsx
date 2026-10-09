'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, EmptyState, LoadingSpinner, SearchInput } from '@/components/ui'
import type { Database } from '@/types/database'

type Supplier = Database['public']['Tables']['suppliers']['Row']

function SupplierPlaceholder() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7l1-3h16l1 3M4 7h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm5 4a3 3 0 006 0"
      />
    </svg>
  )
}

export default function SuppliersPage() {
  const supabase = createClient()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [spentBySupplier, setSpentBySupplier] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [{ data: suppliersData, error: suppliersError }, { data: lots, error: lotsError }] = await Promise.all([
        supabase.from('suppliers').select('*').eq('archived', false).order('name'),
        supabase.from('purchase_lots').select('supplier_id, quantity, unit_cost'),
      ])
      if (suppliersError) throw suppliersError
      if (lotsError) throw lotsError

      const totals: Record<string, number> = {}
      for (const lot of lots ?? []) {
        totals[lot.supplier_id] = (totals[lot.supplier_id] ?? 0) + lot.quantity * lot.unit_cost
      }

      setSuppliers(suppliersData ?? [])
      setSpentBySupplier(totals)
    } catch {
      toast.error('Erro ao carregar fornecedores.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return suppliers
    return suppliers.filter((s) => s.name.toLowerCase().includes(term))
  }, [suppliers, search])

  return (
    <AppLayout title="Fornecedores">
      <div className="flex flex-col gap-5">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fornecedores</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'fornecedor' : 'fornecedores'}
            </p>
          )}
        </div>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Buscar fornecedor..."
        />

        {loading ? (
          <LoadingSpinner label="Carregando fornecedores..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SupplierPlaceholder />}
            title="Nenhum fornecedor encontrado"
            description={
              suppliers.length === 0
                ? 'Cadastre o primeiro fornecedor para começar a registrar compras.'
                : 'Ajuste a busca para encontrar fornecedores.'
            }
            action={
              <Link
                href="/fornecedores/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                + Novo Fornecedor
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filtered.map((supplier) => (
              <Card key={supplier.id} className="p-4 h-full flex gap-3 items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
                  <SupplierPlaceholder />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{supplier.name}</p>
                  {supplier.contact && <p className="text-xs text-gray-500 mt-0.5">{supplier.contact}</p>}
                  <p className="text-xs text-primary-800 font-medium mt-1.5">
                    Total comprado: {(spentBySupplier[supplier.id] ?? 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <Link
          href="/fornecedores/novo"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Fornecedor
        </Link>
      )}
    </AppLayout>
  )
}
