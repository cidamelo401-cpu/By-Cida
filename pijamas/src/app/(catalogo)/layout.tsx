import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Pijamas Digital — Catálogo de Pijamas',
    template: '%s | Pijamas Digital',
  },
  description:
    'Catálogo de pijamas e moda sleepwear. Encontre o pijama perfeito para você e compre pelo WhatsApp.',
  openGraph: {
    title: 'Pijamas Digital — Catálogo de Pijamas',
    description:
      'Pijamas com os melhores preços. Compre pelo WhatsApp!',
    type: 'website',
    images: [
      {
        url: 'https://pijamas-digital.vercel.app/logo-pijamas-digital.jpg',
        width: 1200,
        height: 1200,
        alt: 'Pijamas Digital — Pijamas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pijamas Digital — Catálogo de Pijamas',
    description:
      'Pijamas com os melhores preços. Compre pelo WhatsApp!',
    images: ['https://pijamas-digital.vercel.app/logo-pijamas-digital.jpg'],
  },
}

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
