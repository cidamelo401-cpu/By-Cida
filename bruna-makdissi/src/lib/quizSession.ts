/**
 * Handoff entre o quiz e a página de resultado (Fase 4). Sem backend ainda —
 * fica em sessionStorage (não localStorage: expira com a aba, não é dado
 * "guardado de forma desnecessária"). Quando o Supabase entrar, isso vira o
 * lugar certo para trocar por uma leitura via id/rota dinâmica.
 */

import type { QuizAnswers, RecommendationResult } from '@/data/types';

const KEY = 'bm_quiz_session_v1';

export interface LeadInfo {
  nome: string;
  whatsapp: string;
  email: string;
}

export interface QuizSession {
  answers: QuizAnswers;
  lead: LeadInfo;
  recommendation: RecommendationResult;
  savedAt: string;
}

export function saveQuizSession(session: QuizSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Sem storage disponível (modo privado, etc.) — a página de resultado trata a ausência.
  }
}

export function loadQuizSession(): QuizSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuizSession) : null;
  } catch {
    return null;
  }
}

export function clearQuizSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nada a fazer.
  }
}
