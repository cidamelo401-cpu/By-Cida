'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductsByIds } from '@/data/services';
import { buildWhatsappMessage, buildWhatsappLink } from '@/data/whatsappTemplates';
import { temaQuestion } from '@/data/questions';
import { clearQuizSession, loadQuizSession, type QuizSession } from '@/lib/quizSession';
import { getAnswerInsights, getResultJustification } from '@/lib/insights';
import { getDisclaimerText } from '@/lib/disclaimers';
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
  const produtos = getProductsByIds(recommendation.primaryProductIds);
  const justificativa = getResultJustification(answers);
  const disclaimerTexto = getDisclaimerText(recommendation.disclaimerKind);
  const insights = getAnswerInsights(answers); // só pra mensagem privada de WhatsApp, não aparece na tela
  const mensagem = buildWhatsappMessage(answers.tema, recommendation, insights);
  const linkWhatsapp = buildWhatsappLink(mensagem);
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === answers.tema)?.label ?? answers.tema;

  const ctaLabel =
    produtos.length === 1
      ? `Falar com a Bruna sobre ${produtos[0].nomeCurto ?? produtos[0].nome}`
      : produtos.length > 1
        ? 'Falar com a Bruna sobre estas opções'
        : 'Conversar com a Bruna sobre meu resultado';

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-xl px-6 py-16">
        <Logo variant="claro" className="mb-10 h-7 w-auto" />

        <p className="label-margin text-horizonte-600">Direcionamento pronto</p>

        {recommendation.isDiffuse ? (
          <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">
            Seu momento parece envolver mais de uma área.
          </h1>
        ) : (
          <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">
            {temaLabel} apareceu com mais força nas suas respostas.
          </h1>
        )}

        <p className="mt-4 font-body text-sm font-light leading-relaxed text-tinta-700">{justificativa}</p>

        {produtos.length > 0 && (
          <div className="mt-10 border-t border-noite-900/10 pt-8">
            <p className="label-margin mb-4 text-horizonte-600">
              {produtos.length > 1 ? 'Possíveis caminhos' : 'Um possível primeiro passo'}
            </p>

            <div className="space-y-6">
              {produtos.map((p) => (
                <RecommendationCard key={p.id} produto={p} />
              ))}
            </div>
          </div>
        )}

        {disclaimerTexto && (
          <PublicDisclaimer texto={disclaimerTexto} destaque={recommendation.professionalSupportNotice} />
        )}

        {recommendation.nextStepNote && (
          <div className="mt-8 border-t border-noite-900/10 pt-6">
            <p className="label-margin mb-2 text-horizonte-600">E depois?</p>
            <p className="font-body text-sm font-light leading-relaxed text-tinta-700">{recommendation.nextStepNote}</p>
          </div>
        )}

        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_clicked')}
          className="mt-10 inline-flex items-center justify-center rounded-pill bg-horizonte-500 px-8 py-3 text-center font-body text-sm font-medium text-nevoa-0 transition-colors duration-150 hover:bg-horizonte-600"
        >
          {ctaLabel}
        </a>

        <div className="mt-8">
          <Link
            href="/quiz"
            onClick={() => clearQuizSession()}
            className="font-body text-xs text-tinta-400 hover:text-tinta-700"
          >
            Refazer o direcionamento
          </Link>
        </div>
      </div>
    </main>
  );
}
