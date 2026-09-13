'use client'

import { useState } from 'react'
import { useCart } from './useCart'
import { formatCurrency, getWhatsAppLink } from '@/lib/utils/format'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

export default function CartFloat() {
  const { items, removeItem, clearCart } = useCart()
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  const total = items.reduce((sum, i) => sum + i.price, 0)

  function handleWhatsApp() {
    const lines = items.map(
      (item, i) => `${i + 1}. ${item.team} — ${item.model} — Tam. ${item.sizeLabel} — ${formatCurrency(item.price)}`
    )
    const message = `Oi! Tenho interesse nas seguintes camisas:\n\n${lines.join('\n')}\n\nTotal: ${formatCurrency(total)}`
    const url = getWhatsAppLink(WHATSAPP_NUMBER, message)
    window.location.assign(url)
  }

  return (
    <>
      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A84C] text-black shadow-lg hover:bg-[#b8983f] transition-colors cursor-pointer border-0"
        aria-label="Ver carrinho"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
          {items.length}
        </span>
      </button>

      {/* Cart drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-[#1A1A1A] rounded-t-2xl sm:rounded-2xl border border-white/10 w-full sm:max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">
                Carrinho ({items.length})
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-[#0A0A0A] rounded-xl p-3 border border-white/5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0 flex items-center justify-center">
                    {item.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photo_url} alt={item.team} className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.team}</p>
                    <p className="text-[11px] text-gray-500">{item.model} · Tam. {item.sizeLabel}</p>
                    <p className="text-sm font-bold text-[#C9A84C] mt-1">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start text-gray-500 hover:text-red-400 transition-colors"
                    aria-label="Remover"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="text-lg font-bold text-[#C9A84C]">{formatCurrency(total)}</span>
              </div>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#C9A84C] text-black font-bold uppercase tracking-wide text-base hover:bg-[#b8983f] transition-colors cursor-pointer border-0"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar tudo pelo WhatsApp
              </button>
              <button
                type="button"
                onClick={() => { clearCart(); setOpen(false) }}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
