'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions } from '@/data/questions';
import { getRecommendation } from '@/data/recommendationRules';
import type { QuizAnswers } from '@/data/types';
import { track } from '@/lib/analytics';
import { saveQuizSession, type LeadInfo } from '@/lib/quizSession';
import { QuizProgress } from './QuizProgress';
import { QuestionCard } from './QuestionCard';
import { LeadCapture } from './LeadCapture';
import { Logo } from '../Logo';

const TOTAL_QUESTIONS = quizQuestions.length;

export function QuizFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..3 perguntas, 4 = captura de lead
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const finished = useRef(false);

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

    window.setTimeout(() => {
      if (step < TOTAL_QUESTIONS - 1) {
        setStep(step + 1);
      } else {
        track('lead_started');
        setStep(TOTAL_QUESTIONS);
      }
    }, 220);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleLeadSubmit(lead: LeadInfo) {
    const finalAnswers = answers as QuizAnswers;
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

  const isLeadStep = step === TOTAL_QUESTIONS;
  const question = !isLeadStep ? quizQuestions[step] : null;

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
            <QuizProgress current={step + 1} total={TOTAL_QUESTIONS} />
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
