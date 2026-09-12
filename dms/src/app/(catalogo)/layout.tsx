import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'DMS Sports — Catálogo de Camisas de Futebol',
    template: '%s | DMS Sports',
  },
  description:
    'Catálogo de camisas de futebol originais. Encontre a camisa do seu time favorito e compre pelo WhatsApp.',
  openGraph: {
    title: 'DMS Sports — Catálogo de Camisas de Futebol',
    description:
      'Camisas de futebol originais com os melhores preços. Compre pelo WhatsApp!',
    type: 'website',
    images: [
      {
        url: 'https://dms-sports.vercel.app/logo-dms-sports.jpg',
        width: 1200,
        height: 1200,
        alt: 'DMS Sports — Camisas de Futebol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMS Sports — Catálogo de Camisas de Futebol',
    description:
      'Camisas de futebol originais com os melhores preços. Compre pelo WhatsApp!',
    images: ['https://dms-sports.vercel.app/logo-dms-sports.jpg'],
  },
}

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
