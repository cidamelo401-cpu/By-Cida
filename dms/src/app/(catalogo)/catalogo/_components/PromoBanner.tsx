'use client'

import Image from 'next/image'

/* ── Período da promoção ──
   Visível de 13/11 até 27/11/2026 (inclusive); some sozinho a partir de 28/11.
   Pra desativar antes da hora, é só mudar PROMO_END pra uma data passada. */
const PROMO_START = new Date('2026-11-13T00:00:00-03:00')
const PROMO_END = new Date('2026-11-28T00:00:00-03:00') // exclusivo: some ao bater essa data

export default function PromoBanner() {
  const now = new Date()
  if (now < PROMO_START || now >= PROMO_END) return null

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3">
      <div className="relative w-full overflow-hidden rounded-xl border border-[#C9A84C]/20">
        <Image
          src="/banner-black-friday.png"
          alt="Black Friday DMS Sports: desconto progressivo de até 15% — 1 camisa 5%, 2 camisas 10%, 3 camisas 15%. Pagamento em até 3x sem juros no cartão ou no Pix."
          width={1600}
          height={535}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
