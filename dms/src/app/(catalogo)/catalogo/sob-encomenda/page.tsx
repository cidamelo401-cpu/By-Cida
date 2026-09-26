'use client'

import CatalogShell from '../_components/CatalogShell'
import { getWhatsAppLink } from '@/lib/utils/format'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

export default function SobEncomendaPage() {
  function handleWhatsApp() {
    const message = 'Olá! Gostaria de consultar a disponibilidade de uma camisa sob encomenda.'
    const url = getWhatsAppLink(WHATSAPP_NUMBER, message)
    window.location.assign(url)
  }

  return (
    <CatalogShell>
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <button
            onClick={() => { window.location.href = '/catalogo' }}
            className="hover:text-[#C9A84C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-gray-500"
          >
            Catálogo
          </button>
          <span>/</span>
          <span className="text-gray-300">Sob Encomenda</span>
        </nav>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => { window.location.href = '/catalogo' }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors bg-transparent border-0 cursor-pointer p-0"
            aria-label="Voltar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-white tracking-tight">
            Sob Encomenda
          </h1>
        </div>

        <div className="max-w-lg mx-auto text-center">
          <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C]/10">
              <svg className="h-8 w-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l4 2 4-2 4 3-3 3v10H7V10L4 7l4-3z" />
              </svg>
            </div>

            <p className="text-base text-gray-300 leading-relaxed mb-8">
              Este modelo não está disponível a pronta entrega. Consulte-nos para verificarmos disponibilidade com os nossos fornecedores.
            </p>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#25D366] text-white font-bold uppercase tracking-wide text-sm hover:bg-[#1fb855] transition-colors cursor-pointer border-0"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar pelo WhatsApp
            </button>
          </div>
        </div>
      </main>
    </CatalogShell>
  )
}
