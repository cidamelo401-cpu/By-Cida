import type { Metadata } from 'next';
import { QuizFlow } from '@/components/quiz/QuizFlow';

export const metadata: Metadata = {
  title: 'Descubra seu caminho — Bruna Makdissi',
  description: 'Responda algumas perguntas e descubra qual caminho pode fazer mais sentido para o seu momento.',
};

export default function QuizPage() {
  return <QuizFlow />;
}
