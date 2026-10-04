import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Selecione um arquivo de imagem.' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'A imagem deve ter no máximo 8 MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToR2(fileName, buffer, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Erro ao subir foto para o R2:', err)
    return NextResponse.json({ error: 'Erro ao enviar foto.' }, { status: 500 })
  }
}
