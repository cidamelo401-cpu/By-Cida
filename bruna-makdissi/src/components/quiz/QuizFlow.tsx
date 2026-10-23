'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, temaQuestion, momentoQuestion, SHORT_FLOW_TEMAS } from '@/data/questions';
import { getRecommendation } from '@/data/recommendationRules';
import type { QuizAnswers, TemaId } from '@/data/types';
import { track } from '@/lib/analytics';
import { saveQuizSession, type LeadInfo } from '@/lib/quizSession';
import { QuizProgress } from './QuizProgress';
import { QuestionCard } from './QuestionCard';
import { LeadCapture } from './LeadCapture';
import { Logo } from '../Logo';

/**
 * Pra temas de `SHORT_FLOW_TEMAS` (resultado fixo, ignora histórico/disposição
 * — ver comentário lá), o quiz pula direto de "momento" pra captura de lead.
 * As duas primeiras perguntas são o prefixo comum de todo mundo, por isso dá
 * pra truncar a lista sem quebrar o botão "voltar" (ver handleBack).
 */
const SHORT_QUESTIONS = [temaQuestion, momentoQuestion] as const;

function isShortFlow(tema: TemaId | undefined): boolean {
  return tema !== undefined && SHORT_FLOW_TEMAS.includes(tema);
}

export function QuizFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..3 perguntas (0..1 no fluxo curto), N = captura de lead
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const finished = useRef(false);

  const effectiveQuestions = isShortFlow(answers.tema) ? SHORT_QUESTIONS : quizQuestions;
  const totalQuestions = effectiveQuestions.length;

  useEffect(() => {
    track('quiz_started');
  }, []);

  useEffect(() => {
    function handleUnload() {
      if (!finished.current) track('quiz_abandoned', { step });
    }
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [step]);

  function handleAnswer(questionId: keyof QuizAnswers, value: string) {
    const next = { ...answers, [questionId]: value } as Partial<QuizAnswers>;
    setAnswers(next);
    track('question_answered', { question: questionId, value });

    const nextTotal = isShortFlow(next.tema) ? SHORT_QUESTIONS.length : quizQuestions.length;

    window.setTimeout(() => {
      if (step < nextTotal - 1) {
        setStep(step + 1);
      } else {
        track('lead_started');
        setStep(nextTotal);
      }
    }, 220);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleLeadSubmit(lead: LeadInfo) {
    // Temas do fluxo curto pulam histórico/disposição — preenche com o neutro
    // ('nenhum'/'pontual') só pra satisfazer o tipo; getRecommendation ignora
    // os dois nesses casos, e os textos de resultado tratam isso à parte
    // (ver insights.ts).
    const finalAnswers: QuizAnswers = {
      historico: 'nenhum',
      disposicao: 'pontual',
      ...answers,
    } as QuizAnswers;
    const recommendation = getRecommendation(finalAnswers);

    finished.current = true;
    track('lead_submitted');

    saveQuizSession({
      answers: finalAnswers,
      lead,
      recommendation,
      savedAt: new Date().toISOString(),
    });

    router.push('/resultado');
  }

  const isLeadStep = step === totalQuestions;
  const question = !isLeadStep ? effectiveQuestions[step] : null;

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo variant="claro" className="h-7 w-auto" />
          {step > 0 && !isLeadStep && (
            <button
              type="button"
              onClick={handleBack}
              className="font-body text-sm text-tinta-500 hover:text-noite-900"
            >
              ← Voltar
            </button>
          )}
        </div>

        {!isLeadStep && (
          <div className="mb-10">
            <QuizProgress current={step + 1} total={totalQuestions} />
          </div>
        )}

        <div className="flex-1">
          {question && (
            <QuestionCard
              key={question.id}
              pergunta={question.pergunta}
              opcoes={question.opcoes}
              value={answers[question.id]}
              onAnswer={(value) => handleAnswer(question.id, value)}
            />
          )}
          {isLeadStep && <LeadCapture onSubmit={handleLeadSubmit} />}
        </div>
      </div>
    </main>
  );
}
