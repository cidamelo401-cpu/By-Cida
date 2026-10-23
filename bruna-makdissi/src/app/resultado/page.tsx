import type { Metadata } from 'next';
import { ResultadoView } from '@/components/resultado/ResultadoView';

export const metadata: Metadata = {
  title: 'Seu direcionamento — Bruna Makdissi',
  robots: { index: false, follow: false },
};

export default function ResultadoPage() {
  return <ResultadoView />;
}
