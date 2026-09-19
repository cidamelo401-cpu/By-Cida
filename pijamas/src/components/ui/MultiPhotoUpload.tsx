'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const MAX_PHOTOS = 5

type MultiPhotoUploadProps = {
  photos: string[]
  onChange: (photos: string[]) => void
  disabled?: boolean
}

export function MultiPhotoUpload({ photos, onChange, disabled }: MultiPhotoUploadProps) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemIndex = useRef<number | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return null
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5 MB.')
      return null
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-photos')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('product-photos')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }, [supabase])

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_PHOTOS} fotos atingido.`)
      return
    }
    const toUpload = fileArray.slice(0, remaining)
    if (fileArray.length > remaining) {
      toast.error(`Apenas ${remaining} foto${remaining > 1 ? 's' : ''} pode${remaining > 1 ? 'm' : ''} ser adicionada${remaining > 1 ? 's' : ''}.`)
    }

    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of toUpload) {
        const url = await uploadFile(file)
        if (url) urls.push(url)
      }
      if (urls.length > 0) {
        onChange([...photos, ...urls])
        toast.success(`${urls.length} foto${urls.length > 1 ? 's' : ''} enviada${urls.length > 1 ? 's' : ''}!`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove(index: number) {
    onChange(photos.filter((_, i) => i !== index))
  }

  function handleDragStart(index: number) {
    dragItemIndex.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    // Only show reorder indicator if dragging an existing photo
    if (dragItemIndex.current !== null) {
      setDragOverIndex(index)
    }
  }

  function handleDragEnd() {
    if (dragItemIndex.current !== null && dragOverIndex !== null && dragItemIndex.current !== dragOverIndex) {
      const newPhotos = [...photos]
      const [moved] = newPhotos.splice(dragItemIndex.current, 1)
      newPhotos.splice(dragOverIndex, 0, moved)
      onChange(newPhotos)
    }
    dragItemIndex.current = null
    setDragOverIndex(null)
  }

  function handleDropOnZone(e: React.DragEvent) {
    e.preventDefault()
    // External file drop (not reordering)
    if (dragItemIndex.current === null && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
    dragItemIndex.current = null
    setDragOverIndex(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Fotos do produto
        <span className="text-gray-400 font-normal ml-1">({photos.length}/{MAX_PHOTOS})</span>
      </label>

      {/* Thumbnail strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {photos.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                index === 0 ? 'border-[#C9A84C]' : 'border-gray-200'
              } ${dragOverIndex === index ? 'scale-105 border-[#C9A84C] shadow-lg' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />

              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#C9A84C] text-black text-[10px] font-bold text-center py-0.5">
                  Principal
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || uploading}
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {photos.length < MAX_PHOTOS && (
        <div
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnZone}
          className={`flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed transition cursor-pointer ${
            uploading
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-[#C9A84C] hover:bg-amber-50/30'
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Enviando...</p>
            </>
          ) : (
            <>
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                {photos.length === 0 ? 'Clique ou arraste fotos' : 'Adicionar mais fotos'}
              </p>
              <p className="text-xs text-gray-400">JPG, PNG ou WebP · Máx. 5 MB cada</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
          }
          e.target.value = ''
        }}
      />

      {photos.length > 1 && (
        <p className="text-xs text-gray-400">Arraste para reordenar. A primeira foto aparece no catálogo.</p>
      )}
    </div>
  )
}
