'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildWhatsappMessage, buildWhatsappLink } from '@/data/whatsappTemplates';
import { temaQuestion } from '@/data/questions';
import { clearQuizSession, loadQuizSession, type QuizSession } from '@/lib/quizSession';
import { getResultContent } from '@/data/resultContent';
import type { RecommendationResult, QuizAnswers } from '@/data/types';
import { track } from '@/lib/analytics';
import { RecommendationCard } from './RecommendationCard';
import { PublicDisclaimer } from './PublicDisclaimer';
import { Logo } from '../Logo';

export function ResultadoView() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null | undefined>(undefined);

  useEffect(() => {
    const loaded = loadQuizSession();
    if (!loaded) {
      router.replace('/quiz');
      return;
    }
    setSession(loaded);
    track('result_viewed');
  }, [router]);

  if (!session) return null;

  const { recommendation, answers } = session;

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-xl px-6 py-16">
        <Logo variant="claro" className="mb-10 h-7 w-auto" />
        <p className="label-margin text-horizonte-600">Direcionamento pronto</p>

        {recommendation.primaryProductIds.length === 1 ? (
          <ResultadoUnico productId={recommendation.primaryProductIds[0]} recommendation={recommendation} answers={answers} />
        ) : (
          <ResultadoMultiplo productIds={recommendation.primaryProductIds} recommendation={recommendation} answers={answers} />
        )}

        <div className="mt-8">
          <Link href="/quiz" onClick={() => clearQuizSession()} className="font-body text-xs text-tinta-400 hover:text-tinta-700">
            Refazer o direcionamento
          </Link>
        </div>
      </div>
    </main>
  );
}

type ResultadoUnicoProps = {
  productId: string;
  recommendation: RecommendationResult;
  answers: QuizAnswers;
};

/**
 * A tela de um produto só — segue a "Matriz de conteúdo dos resultados —
 * Direcionamento Bruna Makdissi": direcionamento, entendendo esse momento,
 * o caminho, como funciona, investimento, cuidado, CTA. Todo o texto vem de
 * `resultContent.ts`, transcrito literal da matriz — nada aqui é gerado ou
 * parafraseado.
 *
 * O bloco "O que suas respostas mostraram" existe em `resultContent.ts`
 * (`getInsightsFor`) mas não é renderizado — pedido da Cida.
 */
function ResultadoUnico({ productId, recommendation, answers }: ResultadoUnicoProps) {
  const content = getResultContent(productId);
  if (!content) return null;

  const mensagem = buildWhatsappMessage(answers.tema, recommendation);
  const linkWhatsapp = buildWhatsappLink(mensagem);

  return (
    <>
      <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">{content.direcionamento}</h1>

      <div className="mt-4 space-y-4">
        {content.entendendoEsseMomento.map((paragrafo, i) => (
          <p key={i} className="font-body text-sm font-light leading-relaxed text-tinta-700">
            {paragrafo}
          </p>
        ))}
      </div>

      <div className="mt-10 border-t border-noite-900/10 pt-8">
        <p className="label-margin mb-4 text-horizonte-600">{content.caminhoLabel}</p>
        <h2 className="font-display text-xl text-noite-900">{content.productHeading}</h2>
        {content.productExplanation.map((paragrafo, i) => (
          <p key={i} className="mt-2 font-body text-sm font-light leading-relaxed text-tinta-700">
            {paragrafo}
          </p>
        ))}
      </div>

      <div className="mt-8">
        <p className="label-margin mb-3 text-horizonte-600">Como funciona</p>
        <ul className="space-y-1.5">
          {content.comoFunciona.map((linha) => (
            <li key={linha} className="font-body text-sm text-tinta-700">
              {linha}
            </li>
          ))}
        </ul>
      </div>

      {content.investimento && (
        <div className="mt-8">
          <p className="label-margin mb-2 text-horizonte-600">Investimento</p>
          {content.investimento.map((linha, i) => (
            <p key={i} className={i === 0 ? 'font-body text-sm font-medium text-noite-900' : 'mt-1 font-body text-xs font-light text-tinta-500'}>
              {linha}
            </p>
          ))}
          {content.disponibilidade?.map((linha, i) => (
            <p key={i} className="mt-1 font-body text-xs font-light text-tinta-500">
              {linha}
            </p>
          ))}
        </div>
      )}

      {content.cuidado && <PublicDisclaimer texto={content.cuidado} destaque={recommendation.professionalSupportNotice} />}

      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_clicked')}
        className="mt-10 inline-flex items-center justify-center rounded-pill bg-horizonte-500 px-8 py-3 text-center font-body text-sm font-medium text-nevoa-0 transition-colors duration-150 hover:bg-horizonte-600"
      >
        {content.cta}
      </a>
    </>
  );
}

type ResultadoMultiploProps = {
  productIds: string[];
  recommendation: RecommendationResult;
  answers: QuizAnswers;
};

/**
 * Hoje só acontece pra espiritual + pontual (3 mesas diferentes — a Bruna
 * ajuda a escolher pelo WhatsApp). Como cada mesa já tem seu próprio bloco
 * completo de "direcionamento" na matriz de conteúdo, mas mostrar as 3
 * explicações de tema juntas ficaria repetitivo, aqui só entram os cards de
 * produto (nome, explicação, como funciona, investimento, cuidado) — sem
 * repetir "entendendo esse momento" ou insights por mesa (decisão da Cida).
 */
function ResultadoMultiplo({ productIds, recommendation, answers }: ResultadoMultiploProps) {
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === answers.tema)?.label ?? answers.tema;
  const mensagem = buildWhatsappMessage(answers.tema, recommendation);
  const linkWhatsapp = buildWhatsappLink(mensagem);

  return (
    <>
      <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">{temaLabel} apareceu com mais força nas suas respostas.</h1>

      <div className="mt-10 border-t border-noite-900/10 pt-8">
        <p className="label-margin mb-4 text-horizonte-600">Possíveis caminhos</p>
        {recommendation.nextStepNote && (
          <p className="mb-6 font-body text-sm font-light leading-relaxed text-tinta-700">{recommendation.nextStepNote}</p>
        )}
        <div className="space-y-6">
          {productIds.map((id) => (
            <RecommendationCard key={id} productId={id} />
          ))}
        </div>
      </div>

      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_clicked')}
        className="mt-10 inline-flex items-center justify-center rounded-pill bg-horizonte-500 px-8 py-3 text-center font-body text-sm font-medium text-nevoa-0 transition-colors duration-150 hover:bg-horizonte-600"
      >
        Falar com a Bruna sobre estas opções
      </a>
    </>
  );
}
