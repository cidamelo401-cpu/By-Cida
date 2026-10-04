import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Migração única: baixa as fotos de produto hoje hospedadas no Supabase
 * Storage e as reenvia para o Cloudflare R2, atualizando photo_url/photos
 * de cada produto. Idempotente — pular URLs que já apontam para o R2.
 */
export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem rodar a migração.' }, { status: 403 })
  }

  const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, photo_url, photos')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const urlCache = new Map<string, string>() // url antiga -> url nova (evita baixar a mesma foto 2x)
  let migratedFiles = 0
  let migratedProducts = 0
  let failedFiles = 0
  const failures: string[] = []

  async function migrateUrl(oldUrl: string): Promise<string> {
    if (!oldUrl || oldUrl.startsWith(r2PublicUrl)) return oldUrl
    const cached = urlCache.get(oldUrl)
    if (cached) return cached

    try {
      const res = await fetch(oldUrl)
      if (!res.ok) throw new Error(`fetch falhou (${res.status})`)
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'
      const buffer = Buffer.from(await res.arrayBuffer())
      const ext = (contentType.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
      const fileName = `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const newUrl = await uploadToR2(fileName, buffer, contentType)
      urlCache.set(oldUrl, newUrl)
      migratedFiles++
      return newUrl
    } catch (err) {
      failedFiles++
      failures.push(`${oldUrl}: ${err instanceof Error ? err.message : String(err)}`)
      return oldUrl // mantém a antiga se der erro, não quebra o produto
    }
  }

  for (const product of products ?? []) {
    const photos: string[] = Array.isArray((product as any).photos) ? (product as any).photos : []
    const hasOld =
      (product.photo_url && !product.photo_url.startsWith(r2PublicUrl)) ||
      photos.some((p) => !p.startsWith(r2PublicUrl))
    if (!hasOld) continue

    const newPhotos = await Promise.all(photos.map((p) => migrateUrl(p)))
    const newPhotoUrl = product.photo_url ? await migrateUrl(product.photo_url) : product.photo_url

    const { error: updateError } = await supabase
      .from('products')
      .update({ photo_url: newPhotoUrl, photos: newPhotos.length > 0 ? newPhotos : null })
      .eq('id', product.id)

    if (!updateError) migratedProducts++
  }

  return NextResponse.json({
    migratedProducts,
    migratedFiles,
    failedFiles,
    failures: failures.slice(0, 20),
  })
}
