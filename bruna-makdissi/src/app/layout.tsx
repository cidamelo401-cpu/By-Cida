import type { Metadata } from 'next';
import { Newsreader, Inter } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Sem isso, o Next monta as URLs absolutas de og:image (usadas por
// WhatsApp/Facebook pra buscar a imagem) com "localhost:3000" em produção —
// quebra de verdade o preview do link, não é só aviso de build.
// VERCEL_URL é preenchido automaticamente pelo Vercel com o domínio exato
// de cada deploy.
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Bruna Makdissi — Consciência que transforma',
  description:
    'Responda algumas perguntas e descubra qual caminho pode fazer mais sentido para o seu momento: dinheiro, corpo, relações ou uma questão energética específica.',
  icons: {
    icon: '/brand/simbolo-mono-noite.png',
  },
  openGraph: {
    title: 'Bruna Makdissi — Consciência que transforma',
    description: 'Descubra qual caminho pode fazer mais sentido para o seu momento.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
