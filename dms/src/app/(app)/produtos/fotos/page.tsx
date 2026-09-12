'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button, LoadingSpinner } from '@/components/ui'
import { MODEL_LABELS } from '@/lib/constants/products'
import type { Database } from '@/types/database'
import toast from 'react-hot-toast'

type Product = Database['public']['Tables']['products']['Row']

type UploadItem = {
  product: Product
  file: File | null
  preview: string | null
  uploading: boolean
  done: boolean
}

export default function BulkPhotoUploadPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<UploadItem[]>([])
  const [filter, setFilter] = useState<'sem_foto' | 'todos'>('sem_foto')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('archived', false)
        .order('team')
      if (error) {
        toast.error('Erro ao carregar produtos')
        return
      }
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const filtered = filter === 'sem_foto'
      ? products.filter((p) => !p.photo_url)
      : products
    setItems(
      filtered.map((p) => ({
        product: p,
        file: null,
        preview: p.photo_url ?? null,
        uploading: false,
        done: !!p.photo_url,
      }))
    )
  }, [products, filter])

  const setFile = useCallback((productId: string, file: File) => {
    const preview = URL.createObjectURL(file)
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, file, preview, done: false }
          : item
      )
    )
  }, [])

  const removeFile = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, file: null, preview: item.product.photo_url ?? null, done: !!item.product.photo_url }
          : item
      )
    )
  }, [])

  const pendingCount = items.filter((i) => i.file && !i.done).length
  const doneCount = items.filter((i) => i.done).length

  async function uploadAll() {
    const toUpload = items.filter((i) => i.file && !i.done)
    if (toUpload.length === 0) return

    setUploading(true)
    let successCount = 0

    for (const item of toUpload) {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === item.product.id ? { ...i, uploading: true } : i
        )
      )

      try {
        const file = item.file!
        const ext = file.name.split('.').pop() ?? 'jpg'
        const fileName = `${item.product.team.toLowerCase().replace(/\s+/g, '-')}-${item.product.model}-${item.product.size}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-photos')
          .getPublicUrl(fileName)

        const { error: updateError } = await supabase
          .from('products')
          .update({ photo_url: urlData.publicUrl })
          .eq('id', item.product.id)

        if (updateError) throw updateError

        setItems((prev) =>
          prev.map((i) =>
            i.product.id === item.product.id
              ? { ...i, uploading: false, done: true, preview: urlData.publicUrl }
              : i
          )
        )
        successCount++
      } catch (err) {
        console.error(`Erro ao enviar foto de ${item.product.team}:`, err)
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === item.product.id ? { ...i, uploading: false } : i
          )
        )
        toast.error(`Erro: ${item.product.team} (${item.product.size})`)
      }
    }

    setUploading(false)
    if (successCount > 0) {
      toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} enviada${successCount > 1 ? 's' : ''}!`)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Upload de Fotos">
        <LoadingSpinner label="Carregando produtos..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Upload de Fotos">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Upload de Fotos em Massa</h1>
            <p className="text-sm text-gray-500 mt-1">
              {products.filter((p) => !p.photo_url).length} produtos sem foto · {products.filter((p) => p.photo_url).length} com foto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('sem_foto')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'sem_foto'
                ? 'bg-primary-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sem foto
          </button>
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'todos'
                ? 'bg-primary-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
        </div>

        {pendingCount > 0 && (
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              {pendingCount} foto{pendingCount > 1 ? 's' : ''} selecionada{pendingCount > 1 ? 's' : ''}
            </span>
            <Button onClick={uploadAll} loading={uploading}>
              Enviar {pendingCount > 1 ? 'todas' : ''}
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">🎉 Todos os produtos já têm foto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {items.map((item) => (
              <PhotoCard
                key={item.product.id}
                item={item}
                onFile={setFile}
                onRemove={removeFile}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function PhotoCard({
  item,
  onFile,
  onRemove,
}: {
  item: UploadItem
  onFile: (productId: string, file: File) => void
  onRemove: (productId: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { product, preview, uploading, done, file } = item

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <div
        className={`aspect-square relative flex items-center justify-center cursor-pointer group ${
          preview ? '' : 'bg-gray-50'
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f?.type.startsWith('image/')) onFile(product.id, f)
        }}
      >
        {uploading && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}

        {done && !file && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {file && !done && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(product.id)
            }}
            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={product.team} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-[#C9A84C] transition">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">Adicionar foto</span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{product.team}</p>
        <p className="text-xs text-gray-500 truncate">
          {MODEL_LABELS[product.model]} · {product.size}
          {product.season ? ` · ${product.season}` : ''}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(product.id, f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
