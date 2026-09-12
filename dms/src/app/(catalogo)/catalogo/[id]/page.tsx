'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getWhatsAppLink } from '@/lib/utils/format'
import { MODEL_LABELS, VERSION_LABELS } from '@/lib/constants/products'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

function ShirtPlaceholder() {
  return (
    <svg className="h-32 w-32 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const supabase = createClient()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('archived', false)
        .eq('status', 'disponivel')
        .single()
      setProduct(data)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <Header />
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <ShirtPlaceholder />
          <p className="mt-4 font-semibold text-gray-900">Produto não encontrado</p>
          <p className="mt-1 text-sm text-gray-500">
            Este produto pode estar esgotado ou foi removido.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] text-white text-sm font-medium hover:bg-[#0a0a0a] transition-colors"
          >
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  const whatsappMessage = `Oi! Vi a camisa ${product.team} ${product.size} no catálogo e tenho interesse!`
  const whatsappUrl = getWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <Link href="/catalogo" className="text-sm text-gray-500 hover:text-[#141414] transition-colors">
            ← Voltar ao catálogo
          </Link>
        </nav>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              {product.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.photo_url}
                  alt={product.team}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShirtPlaceholder />
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">{product.team}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {product.country_league ?? ''}{product.country_league && product.season ? ' · ' : ''}{product.season ?? ''}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <InfoTag label="Modelo" value={MODEL_LABELS[product.model]} />
                <InfoTag label="Versão" value={VERSION_LABELS[product.version]} />
                <InfoTag label="Tamanho" value={product.size} />
              </div>

              {product.quantity === 1 && (
                <div className="mt-3 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Última unidade disponível!
                </div>
              )}

              <p className="mt-6 text-3xl font-bold text-[#C9A84C]">
                {formatCurrency(product.sell_price)}
              </p>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#25D366] text-white font-semibold text-base hover:bg-[#1ebe5a] transition-colors shadow-sm"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Comprar pelo WhatsApp
              </a>

              <p className="mt-3 text-xs text-gray-400 text-center">
                Ao clicar, você será redirecionado para o WhatsApp da DMS Sports
              </p>

              {product.notes && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Observações</p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{product.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#141414] text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/catalogo" className="flex items-center gap-2.5">
          <Image
            src="/logo-dms-sports.jpg"
            alt="DMS Sports"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <p className="text-sm font-bold leading-tight">
              DMS <span className="text-[#C9A84C]">Sports</span>
            </p>
            <p className="text-[10px] text-gray-400">Camisas de Futebol</p>
          </div>
        </Link>
        <a
          href="https://www.instagram.com/dmssports.oficial"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#C9A84C] transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <span className="hidden sm:inline">@dmssports.oficial</span>
        </a>
      </div>
    </header>
  )
}

function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </span>
  )
}
