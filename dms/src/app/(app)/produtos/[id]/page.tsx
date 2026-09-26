'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  LoadingSpinner,
  Modal,
  Select,
  Textarea,
} from '@/components/ui'
import { registerStockMovement, archiveProduct, deleteProduct } from '@/lib/actions/products'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import {
  CATALOG_SIZE_LABELS,
  MODEL_LABELS,
  MOVEMENT_TYPE_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  VERSION_LABELS,
} from '@/lib/constants/products'
import type { Database, StockMovementType } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type StockMovement = Database['public']['Tables']['stock_movements']['Row']

function ShirtPlaceholder() {
  return (
    <svg className="h-24 w-24 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const router = useRouter()
  const supabase = createClient()
  const { user, isAdmin, signOut, profile } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  const [movementOpen, setMovementOpen] = useState(false)
  const [movementType, setMovementType] = useState<StockMovementType>('entrada')
  const [movementQty, setMovementQty] = useState('1')
  const [movementReason, setMovementReason] = useState('')
  const [movementSaving, setMovementSaving] = useState(false)

  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [{ data: productData, error: productError }, { data: movementData, error: movementError }] =
          await Promise.all([
            supabase.from('products').select('*').eq('id', id).single(),
            supabase
              .from('stock_movements')
              .select('*')
              .eq('product_id', id)
              .order('created_at', { ascending: false }),
          ])

        if (productError) throw productError
        setProduct(productData)
        if (!movementError) setMovements(movementData ?? [])
      } catch {
        toast.error('Erro ao carregar produto.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadTick])

  function reload() {
    setReloadTick((tick) => tick + 1)
  }

  async function handleDuplicate() {
    if (!product) return
    const params = new URLSearchParams({
      team: product.team,
      country_league: product.country_league ?? '',
      season: product.season ?? '',
      model: product.model,
      version: product.version,
      size: product.size,
      cost_price: String(product.cost_price),
      sell_price: String(product.sell_price),
      supplier: product.supplier ?? '',
      photo_url: product.photo_url ?? '',
      notes: product.notes ?? '',
      min_stock: String(product.min_stock),
    })
    router.push(`/produtos/novo?${params.toString()}`)
  }

  async function handleArchive() {
    if (!product) return
    setArchiving(true)
    try {
      await archiveProduct(product.id, !product.archived)
      toast.success(product.archived ? 'Produto reativado.' : 'Produto arquivado.')
      setArchiveOpen(false)
      reload()
    } catch {
      toast.error('Erro ao arquivar produto.')
    } finally {
      setArchiving(false)
    }
  }

  async function handleDelete() {
    if (!product) return
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      toast.success('Produto excluído permanentemente.')
      router.push('/produtos')
    } catch {
      toast.error('Erro ao excluir produto.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleMovementSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !user) return

    const rawQty = Number(movementQty)
    if (Number.isNaN(rawQty) || rawQty === 0) {
      toast.error('Informe uma quantidade válida.')
      return
    }

    const isOutbound = ['venda', 'perda', 'avaria', 'troca'].includes(movementType)
    const signedQty = isOutbound ? -Math.abs(rawQty) : Math.abs(rawQty)

    setMovementSaving(true)
    try {
      await registerStockMovement({
        product_id: product.id,
        type: movementType,
        quantity: movementType === 'ajuste' ? rawQty : signedQty,
        reason: movementReason.trim() || undefined,
        created_by: user.id,
      })
      toast.success('Movimentação registrada com sucesso!')
      setMovementOpen(false)
      setMovementQty('1')
      setMovementReason('')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar movimentação.')
    } finally {
      setMovementSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Produto" showBack userName={profile?.full_name ?? undefined} userRole={profile?.role} onSignOut={signOut}>
        <LoadingSpinner label="Carregando produto..." />
      </AppLayout>
    )
  }

  if (!product) {
    return (
      <AppLayout title="Produto" showBack userName={profile?.full_name ?? undefined} userRole={profile?.role} onSignOut={signOut}>
        <EmptyState title="Produto não encontrado" description="Este produto pode ter sido removido." />
      </AppLayout>
    )
  }

  const lowStock = product.quantity <= product.min_stock

  return (
    <AppLayout
      title={product.team}
      showBack
      userName={profile?.full_name ?? undefined}
      userRole={profile?.role}
      onSignOut={signOut}
    >
      <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-10">
        <Card className="overflow-hidden">
          <div className="aspect-[4/3] sm:aspect-[16/7] bg-primary-50 flex items-center justify-center relative">
            {product.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.photo_url} alt={product.team} className="h-full w-full object-cover" />
            ) : (
              <ShirtPlaceholder />
            )}
            {product.archived && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gray-800/80 text-white text-xs font-medium">
                Arquivado
              </span>
            )}
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{product.team}</h1>
                <p className="text-sm text-gray-500">
                  {product.country_league ?? '—'} · {product.season ?? '—'}
                </p>
              </div>
              <Badge status={STATUS_BADGE[product.status]}>{STATUS_LABELS[product.status]}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <InfoItem label="Modelo" value={MODEL_LABELS[product.model]} />
              <InfoItem label="Versão" value={VERSION_LABELS[product.version]} />
              <InfoItem label="Tamanho" value={CATALOG_SIZE_LABELS[product.size] ?? product.size} />
              <InfoItem label="SKU" value={product.sku ?? '—'} mono />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              <div className={`rounded-xl p-3 ${lowStock ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500">Estoque atual</p>
                <p className={`text-xl font-bold ${lowStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.quantity} un.
                </p>
                {lowStock && <p className="text-xs text-red-600 mt-0.5">Abaixo do mínimo ({product.min_stock})</p>}
              </div>
              <div className="rounded-xl p-3 bg-gray-50">
                <p className="text-xs text-gray-500">Custo unitário</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(product.cost_price)}</p>
              </div>
              <div className="rounded-xl p-3 bg-primary-50">
                <p className="text-xs text-primary-800">Preço de venda</p>
                <p className="text-xl font-bold text-primary-900">{formatCurrency(product.sell_price)}</p>
              </div>
            </div>

            {product.supplier && <InfoItem label="Fornecedor" value={product.supplier} />}
            {product.notes && (
              <div>
                <p className="text-xs text-gray-500">Observações</p>
                <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{product.notes}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          {!product.archived && (
            <Link href={`/produtos/${product.id}/editar`}>
              <Button variant="secondary">Editar</Button>
            </Link>
          )}
          <Button variant="secondary" onClick={handleDuplicate}>
            Duplicar
          </Button>
          {!product.archived && product.quantity > 0 && (
            <Link href={`/vendas/nova?product_id=${product.id}&status=reservada`}>
              <Button variant="primary">Reservar</Button>
            </Link>
          )}
          {!product.archived && (
            <Button variant="secondary" onClick={() => setMovementOpen(true)}>
              Registrar Movimentação
            </Button>
          )}
          {isAdmin && (
            <Button variant="danger" onClick={() => setArchiveOpen(true)}>
              {product.archived ? 'Reativar' : 'Arquivar'}
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            🗑️ Excluir
          </Button>
        </div>

        <Card className="p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Histórico de movimentações</h2>
          {movements.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {movements.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{MOVEMENT_TYPE_LABELS[m.type] ?? m.type}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(m.created_at)}
                      {m.reason ? ` · ${m.reason}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${m.quantity < 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {m.quantity > 0 ? '+' : ''}
                      {m.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.previous_quantity} → {m.new_quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        title="Registrar movimentação"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMovementOpen(false)} disabled={movementSaving}>
              Cancelar
            </Button>
            <Button onClick={handleMovementSubmit} loading={movementSaving}>
              Registrar
            </Button>
          </>
        }
      >
        <form onSubmit={handleMovementSubmit} className="flex flex-col gap-4">
          <Select
            label="Tipo"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as StockMovementType)}
          >
            {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Quantidade"
            type="number"
            min={1}
            value={movementQty}
            onChange={(e) => setMovementQty(e.target.value)}
            helper={
              movementType === 'ajuste'
                ? 'Pode ser positiva (entrada) ou negativa (saída).'
                : 'Informe apenas o valor positivo.'
            }
          />
          <Textarea
            label="Motivo"
            value={movementReason}
            onChange={(e) => setMovementReason(e.target.value)}
            placeholder="Ex: Venda via WhatsApp"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={archiveOpen}
        title={product.archived ? 'Reativar produto?' : 'Arquivar produto?'}
        description={
          product.archived
            ? 'O produto voltará a aparecer na listagem principal.'
            : 'O produto deixará de aparecer na listagem principal, mas pode ser reativado depois.'
        }
        confirmLabel={product.archived ? 'Reativar' : 'Arquivar'}
        danger={!product.archived}
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir produto permanentemente?"
        description="Esta ação não pode ser desfeita. O produto e todo o seu histórico de movimentações serão apagados."
        confirmLabel="Excluir"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </AppLayout>
  )
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
