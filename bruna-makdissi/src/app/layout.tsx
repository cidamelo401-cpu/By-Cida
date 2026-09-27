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

export const metadata: Metadata = {
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
