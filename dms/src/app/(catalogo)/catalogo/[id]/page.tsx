'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getWhatsAppLink } from '@/lib/utils/format'
import { MODEL_LABELS, VERSION_LABELS, CATALOG_SIZE_LABELS } from '@/lib/constants/products'
import type { Database, ProductSize } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

const SIZE_ORDER: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']

function ShirtPlaceholder() {
  return (
    <svg className="h-32 w-32 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
    </svg>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [siblings, setSiblings] = useState<Product[]>([])
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadWhatsapp, setLeadWhatsapp] = useState('')
  const [savingLead, setSavingLead] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const supabase = createClient()

        // Load the main product
        const { data, error: queryError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('archived', false)
          .single()

        if (queryError) {
          console.error('Supabase error:', queryError)
          setError(queryError.message)
          return
        }
        setProduct(data)
        setSelectedSize(data.size)

        // Load siblings (same team + model + season)
        let query = supabase
          .from('products')
          .select('*')
          .eq('team', data.team)
          .eq('model', data.model)
          .eq('archived', false)
          .eq('status', 'disponivel')
          .gt('quantity', 0)

        if (data.season) {
          query = query.eq('season', data.season)
        }

        const { data: sibs } = await query
        if (sibs) {
          // Filter to same color/notes group
          const colorNote = data.notes?.match(/Cor:\s*(\w+)/i)?.[1] ?? ''
          const filtered = sibs.filter((s) => {
            const sibColor = s.notes?.match(/Cor:\s*(\w+)/i)?.[1] ?? ''
            return sibColor === colorNote
          })
          filtered.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
          setSiblings(filtered)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product?.team ?? 'DMS Sports',
          url: typeof window !== 'undefined' ? window.location.href : '',
        })
      } catch {
        // user cancelled share — ignore
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Header />
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="rounded-xl bg-red-950/40 border border-red-900 p-4 max-w-sm">
            <p className="text-sm font-medium text-red-400">Erro ao carregar produto</p>
            <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
          </div>
          <Link
            href="/catalogo"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A84C] text-black text-sm font-bold hover:bg-[#b8983f] transition-colors"
          >
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Header />
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <ShirtPlaceholder />
          <p className="mt-4 font-semibold text-white">Produto não encontrado</p>
          <p className="mt-1 text-sm text-gray-500">
            Este produto pode estar esgotado ou foi removido.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A84C] text-black text-sm font-bold hover:bg-[#b8983f] transition-colors"
          >
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  // Build photos array: prefer photos field, fallback to photo_url, then sibling photo
  const productPhotos: string[] = (product as any).photos?.length
    ? (product as any).photos
    : product.photo_url
      ? [product.photo_url]
      : []
  const fallbackPhoto = siblings.find((s) => s.photo_url)?.photo_url
  const allPhotos = productPhotos.length > 0 ? productPhotos : (fallbackPhoto ? [fallbackPhoto] : [])
  const photoUrl = allPhotos[activePhotoIndex] ?? allPhotos[0] ?? null

  const sizeForMessage = selectedSize ?? product.size
  const sizeLabel = CATALOG_SIZE_LABELS[sizeForMessage] ?? sizeForMessage
  const whatsappMessage = `Oi! Vi a camisa ${product.team} tamanho ${sizeLabel} no catálogo e tenho interesse!`
  const whatsappUrl = getWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLead(true)
    try {
      const supabase = createClient()
      const cleanPhone = leadWhatsapp.replace(/\D/g, '')
      const phone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone

      // Build WhatsApp URL before any async work (to avoid popup blocker)
      const msg = `Oi! Meu nome é ${leadName.trim()}. Vi a camisa ${product!.team} tamanho ${sizeLabel} no catálogo e tenho interesse!`
      const url = getWhatsAppLink(WHATSAPP_NUMBER, msg)

      // Save lead in background — don't block the redirect
      Promise.resolve(
        supabase.from('leads').insert({
          name: leadName.trim(),
          whatsapp: phone,
          product_id: product!.id,
          team: product!.team,
          model: product!.model,
          size: sizeForMessage,
          sell_price: product!.sell_price,
        })
      ).catch((err: unknown) => console.error('Error saving lead:', err))

      // Redirect immediately (no await = no popup block)
      window.location.href = url
      setShowLeadModal(false)
      setLeadName('')
      setLeadWhatsapp('')
    } catch (err) {
      console.error('Error in lead flow:', err)
      // Even if something fails, still redirect to WhatsApp
      window.location.href = whatsappUrl
      setShowLeadModal(false)
    } finally {
      setSavingLead(false)
    }
  }

  const totalQuantity = siblings.reduce((sum, s) => sum + s.quantity, 0)
  const isKids = SIZE_ORDER.indexOf(product.size) < 5 || siblings.some((s) => SIZE_ORDER.indexOf(s.size) < 5)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/catalogo" className="hover:text-[#C9A84C] transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-gray-400">{product.team}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F1F12] to-[#1A1A1A] border border-white/5 aspect-square flex items-center justify-center">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={product.team}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShirtPlaceholder />
              )}
            </div>

            {allPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allPhotos.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActivePhotoIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === activePhotoIndex
                        ? 'border-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white leading-tight">
              {product.team}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {product.country_league ?? ''}{product.country_league && product.season ? ' · ' : ''}{product.season ?? ''}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <InfoChip>{MODEL_LABELS[product.model]}</InfoChip>
              <InfoChip>{VERSION_LABELS[product.version]}</InfoChip>
            </div>

            {/* Size selector */}
            {siblings.length > 1 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Tamanho
                </p>
                <div className="flex flex-wrap gap-2">
                  {siblings.map((sib) => (
                    <button
                      key={sib.id}
                      onClick={() => setSelectedSize(sib.size)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedSize === sib.size
                          ? 'bg-[#C9A84C] text-black shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                          : 'bg-[#1A1A1A] border border-white/10 text-gray-300 hover:border-[#C9A84C]/50'
                      }`}
                    >
                      {CATALOG_SIZE_LABELS[sib.size] ?? sib.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {siblings.length <= 1 && (
              <div className="mt-4">
                <InfoChip>Tamanho {CATALOG_SIZE_LABELS[product.size] ?? product.size}</InfoChip>
              </div>
            )}

            <button
              onClick={() => setShowSizeChart(true)}
              className="mt-3 self-start text-xs text-[#C9A84C] underline underline-offset-2 hover:text-[#b8983f] transition-colors"
            >
              📏 Tabela de medidas
            </button>

            {totalQuantity <= siblings.length && totalQuantity > 0 && (
              <div className="mt-3 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 text-red-400 text-xs font-semibold">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {totalQuantity === 1 ? 'Última unidade disponível!' : 'Últimas unidades!'}
              </div>
            )}

            <p className="mt-6 text-3xl sm:text-4xl font-extrabold text-[#C9A84C]">
              {formatCurrency(product.sell_price)}
            </p>

            {/* WhatsApp CTA — forces navigation even if Next.js intercepts */}
            <a
              href={whatsappUrl}
              rel="noopener noreferrer"
              onClick={(e) => { e.preventDefault(); window.location.href = whatsappUrl }}
              className="mt-6 flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#C9A84C] text-black font-bold uppercase tracking-wide text-base hover:bg-[#b8983f] transition-colors no-underline"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Comprar pelo WhatsApp
            </a>

            <button
              onClick={handleShare}
              className="mt-3 flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 100 4.317m9.632-11.317a3 3 0 100-4.317m0 4.317a3 3 0 000-4.317m0 4.317L8.684 13.342m9.632-8.658L8.684 9.658" />
              </svg>
              Compartilhar
            </button>

            <p className="mt-3 text-xs text-gray-600 text-center">
              Ao clicar, você será redirecionado para o WhatsApp da DMS Sports
            </p>

            {product.notes && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Observações</p>
                <p className="mt-1 text-sm text-gray-400 whitespace-pre-wrap">{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowSizeChart(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase">📏 Tabela de Medidas</h3>
              <button onClick={() => setShowSizeChart(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {isKids && (
                <>
                  <p className="text-xs font-semibold text-[#C9A84C] uppercase mb-2">Tamanhos Infantis</p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#C9A84C]/30 bg-[#0A0A0A]">
                          <th className="py-2.5 px-2 text-left text-xs font-bold text-[#C9A84C] uppercase">Tam.</th>
                          <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Idade</th>
                          <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Altura</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {[
                          { size: 'T20', age: '3-4 anos', height: '98-104 cm' },
                          { size: 'T22', age: '5-6 anos', height: '110-116 cm' },
                          { size: 'T24', age: '7-8 anos', height: '122-128 cm' },
                          { size: 'T26', age: '9-10 anos', height: '134-140 cm' },
                          { size: 'T28', age: '11-12 anos', height: '146-152 cm' },
                        ].map((row) => (
                          <tr
                            key={row.size}
                            className={`border-b border-white/5 ${selectedSize === row.size ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-bold' : ''}`}
                          >
                            <td className="py-2.5 px-2 font-semibold">{row.size}</td>
                            <td className="py-2.5 px-2 text-center text-xs">{row.age}</td>
                            <td className="py-2.5 px-2 text-center text-xs">{row.height}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <p className="text-xs font-semibold text-[#C9A84C] uppercase mb-2">Tamanhos Adultos</p>
              <p className="text-xs text-gray-500 mb-3">Versão Fan (Torcedor). Medidas aproximadas.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#C9A84C]/30 bg-[#0A0A0A]">
                      <th className="py-2.5 px-2 text-left text-xs font-bold text-[#C9A84C] uppercase">Tam.</th>
                      <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Comp.</th>
                      <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Larg.</th>
                      <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Altura</th>
                      <th className="py-2.5 px-2 text-center text-xs font-bold text-[#C9A84C] uppercase">Peso</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      { size: 'PP', label: 'XS', length: '67-69', width: '51-53', height: '155-162', weight: '45-50' },
                      { size: 'P', label: 'S', length: '69-71', width: '53-55', height: '162-170', weight: '50-62' },
                      { size: 'M', label: 'M', length: '71-73', width: '55-57', height: '170-176', weight: '62-78' },
                      { size: 'G', label: 'L', length: '73-75', width: '57-58', height: '176-182', weight: '78-83' },
                      { size: 'GG', label: 'XL', length: '75-78', width: '58-60', height: '182-190', weight: '83-90' },
                      { size: '2XG', label: '2XL', length: '78-81', width: '60-62', height: '190-195', weight: '90-97' },
                      { size: '3XG', label: '3XL', length: '81-83', width: '62-64', height: '192-197', weight: '97-104' },
                    ].map((row) => (
                      <tr
                        key={row.size}
                        className={`border-b border-white/5 ${selectedSize === row.size ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-bold' : ''}`}
                      >
                        <td className="py-2.5 px-2 font-semibold">{row.label}</td>
                        <td className="py-2.5 px-2 text-center text-xs">{row.length}</td>
                        <td className="py-2.5 px-2 text-center text-xs">{row.width}</td>
                        <td className="py-2.5 px-2 text-center text-xs">{row.height}</td>
                        <td className="py-2.5 px-2 text-center text-xs">{row.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[10px] text-gray-600 text-center">Comprimento e largura em cm · Altura em cm · Peso em kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowLeadModal(false)}>
          <div className="bg-[#1A1A1A] rounded-t-2xl sm:rounded-2xl border border-white/10 w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Quero essa camisa!</h3>
                <p className="text-xs text-gray-500 mt-0.5">Preencha para falar conosco no WhatsApp</p>
              </div>
              <button onClick={() => setShowLeadModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLeadSubmit} className="p-5 space-y-4">
              <div>
                <label htmlFor="lead-name" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                  Seu nome
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="w-full rounded-xl bg-[#0A0A0A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lead-whatsapp" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                  Seu WhatsApp
                </label>
                <input
                  id="lead-whatsapp"
                  type="tel"
                  required
                  value={leadWhatsapp}
                  onChange={(e) => setLeadWhatsapp(e.target.value)}
                  placeholder="11999999999"
                  className="w-full rounded-xl bg-[#0A0A0A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={savingLead}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#C9A84C] text-black font-bold uppercase tracking-wide text-base hover:bg-[#b8983f] transition-colors disabled:opacity-60"
              >
                {savingLead ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                )}
                {savingLead ? 'Enviando...' : 'Ir para o WhatsApp'}
              </button>
              <p className="text-[10px] text-gray-600 text-center">
                Seus dados são usados apenas para contato sobre esta camisa.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Floating WhatsApp button */}
      <a
        href={whatsappUrl}
        rel="noopener noreferrer"
        onClick={(e) => { e.preventDefault(); window.location.href = whatsappUrl }}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5a] transition-colors"
        aria-label="Falar no WhatsApp"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
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
            <p className="text-sm font-bold leading-tight text-white">
              DMS <span className="text-[#C9A84C]">Sports</span>
            </p>
            <p className="text-[10px] text-gray-500">Camisas de Futebol</p>
          </div>
        </Link>
        <a
          href="https://www.instagram.com/dmssports.oficial"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C9A84C] transition-colors"
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

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#C9A84C]/30 text-xs font-bold uppercase tracking-wide text-[#C9A84C]">
      {children}
    </span>
  )
}
