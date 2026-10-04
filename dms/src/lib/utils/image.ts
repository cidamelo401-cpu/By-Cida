/**
 * Comprime uma imagem no navegador antes do upload: redimensiona para um lado
 * máximo e reencoda em JPEG com qualidade reduzida. Reduz drasticamente o
 * tráfego (egress) gasto ao servir essas fotos no catálogo.
 */
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.8 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  // GIFs podem ser animados — comprimir via canvas perderia a animação, então mantemos o original.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob) return file

    // Se a compressão não ajudou (raro, ex: imagem já muito leve), mantém o original.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch {
    // Qualquer falha na compressão não deve travar o upload — sobe o arquivo original.
    return file
  }
}
