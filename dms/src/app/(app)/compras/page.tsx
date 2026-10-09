'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, EmptyState, LoadingSpinner, Select } from '@/components/ui'
import type { Database } from '@/types/database'

type PurchaseLot = Database['public']['Tables']['purchase_lots']['Row'] & {
  suppliers: { name: string } | null
  products: { team: string; model: string; version: string; size: string; season: string } | null
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PurchaseLotsPage() {
  const supabase = createClient()
  const [lots, setLots] = useState<PurchaseLot[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierFilter, setSupplierFilter] = useState('')
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [{ data: lotsData, error: lotsError }, { data: suppliersData, error: suppliersError }] =
        await Promise.all([
          supabase
            .from('purchase_lots')
            .select('*, suppliers(name), products(team, model, version, size, season)')
            .order('purchase_date', { ascending: false }),
          supabase.from('suppliers').select('id, name').eq('archived', false).order('name'),
        ])
      if (lotsError) throw lotsError
      if (suppliersError) throw suppliersError
      setLots((lotsData as unknown as PurchaseLot[]) ?? [])
      setSuppliers(suppliersData ?? [])
    } catch {
      toast.error('Erro ao carregar compras.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!supplierFilter) return lots
    return lots.filter((lot) => lot.supplier_id === supplierFilter)
  }, [lots, supplierFilter])

  const totalGasto = useMemo(
    () => filtered.reduce((sum, lot) => sum + lot.quantity * lot.unit_cost, 0),
    [filtered]
  )

  return (
    <AppLayout title="Compras">
      <div className="flex flex-col gap-5">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Compras</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'lote comprado' : 'lotes comprados'} ·{' '}
              <span className="font-medium text-primary-800">{formatCurrency(totalGasto)}</span>
            </p>
          )}
        </div>

        <Select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          <option value="">Todos os fornecedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {loading ? (
          <LoadingSpinner label="Carregando compras..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma compra registrada"
            description="Lance a primeira compra para começar a controlar custo e fornecedor por camisa."
            action={
              <Link
                href="/compras/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
              >
                + Nova Compra
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 pb-20">
            {filtered.map((lot) => (
              <Card key={lot.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {lot.products ? `${lot.products.team} · ${lot.products.season} · ${lot.products.size}` : 'Produto removido'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lot.suppliers?.name ?? 'Fornecedor removido'} ·{' '}
                      {new Date(lot.purchase_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(lot.quantity * lot.unit_cost)}</p>
                    <p className="text-xs text-gray-500">
                      {lot.quantity}x {formatCurrency(lot.unit_cost)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Restante neste lote: {lot.remaining_quantity} de {lot.quantity}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <Link
          href="/compras/novo"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Compra
        </Link>
      )}
    </AppLayout>
  )
}
