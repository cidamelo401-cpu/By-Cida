'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductsByIds } from '@/data/services';
import { buildWhatsappMessage, buildWhatsappLink } from '@/data/whatsappTemplates';
import { clearQuizSession, loadQuizSession, type QuizSession } from '@/lib/quizSession';
import { track } from '@/lib/analytics';

/**
 * Stub funcional — a página de resultado de verdade (insights por resposta,
 * "e depois?", disclaimers por produto, layout final) é a Fase 4. Isso aqui
 * só fecha o ciclo ponta a ponta pra testar o quiz.
 */
export function ResultadoPlaceholder() {
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

  if (session === undefined || session === null) {
    return null;
  }

  const { recommendation, answers } = session;
  const produtos = getProductsByIds(recommendation.primaryProductIds);
  const mensagem = buildWhatsappMessage(answers.tema, recommendation);
  const linkWhatsapp = buildWhatsappLink(mensagem);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <p className="label-margin text-horizonte-600">Direcionamento pronto</p>

      {recommendation.isDiffuse || produtos.length === 0 ? (
        <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">
          Seu momento parece envolver mais de uma área.
        </h1>
      ) : (
        <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">
          {produtos.map((p) => p.nome).join(' ou ')}
        </h1>
      )}

      {produtos.map((p) => (
        <div key={p.id} className="mt-6 border-t border-noite-900/10 pt-6">
          <h2 className="font-display text-lg text-noite-900">{p.nome}</h2>
          <p className="mt-2 font-body text-sm font-light leading-relaxed text-tinta-700">{p.paraQueServe}</p>
        </div>
      ))}

      {recommendation.nextStepNote && (
        <p className="mt-6 font-body text-sm font-light text-tinta-700">{recommendation.nextStepNote}</p>
      )}

      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_clicked')}
        className="mt-10 inline-flex items-center justify-center rounded-pill bg-horizonte-500 px-8 py-3 font-body text-sm font-medium text-nevoa-0 transition-colors duration-150 hover:bg-horizonte-600"
      >
        Conversar com a Bruna sobre meu resultado
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
    </main>
  );
}
