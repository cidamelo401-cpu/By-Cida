import type { Metadata } from 'next';
import { ResultadoPlaceholder } from '@/components/ResultadoPlaceholder';

export const metadata: Metadata = {
  title: 'Seu direcionamento — Bruna Makdissi',
  robots: { index: false, follow: false },
};

export default function ResultadoPage() {
  return <ResultadoPlaceholder />;
}
