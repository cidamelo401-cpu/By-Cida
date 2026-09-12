'use client'

import Image from 'next/image'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511992963041'

export default function CatalogFooter() {
  return (
    <footer className="bg-black border-t border-white/5 text-gray-500 py-8 mt-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-dms-sports.jpg"
            alt="DMS Sports"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-sm">
            DMS <span className="text-[#C9A84C]">Sports</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-[#C9A84C] transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/dmssports.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-[#C9A84C] transition-colors"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
