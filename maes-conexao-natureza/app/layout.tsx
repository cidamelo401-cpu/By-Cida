import type { Metadata, Viewport } from 'next';
import { Baloo_2, Quicksand } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-baloo' });
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-quicksand' });

export const metadata: Metadata = {
  title: 'Mães, Conexão e Natureza',
  description: 'App das participantes da 3ª edição — programação do dia, massagem e mural da comunidade.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mães e Natureza'
  }
};

export const viewport: Viewport = {
  themeColor: '#1E3123',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={baloo.variable + ' ' + quicksand.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
