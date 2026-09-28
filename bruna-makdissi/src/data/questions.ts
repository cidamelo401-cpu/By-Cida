/**
 * As 4 perguntas oficiais do questionário, conforme aprovado pela Bruna e pelo Jean
 * (aba "Direcionamento", linha 17 do catálogo v1.0). Uma pergunta por tela.
 *
 * Regra de ouro do documento fonte, válida para toda a UI: nunca inferir condição
 * financeira, de saúde ou vulnerabilidade — a pessoa sempre escolhe (pergunta 4).
 */

import type { DisposicaoId, HistoricoId, MomentoId, QuizQuestion, TemaId } from './types';

export const temaQuestion: QuizQuestion<TemaId> = {
  id: 'tema',
  pergunta: 'O que você quer resolver agora?',
  opcoes: [
    { id: 'dinheiro', label: 'Dinheiro', emoji: '💰' },
    { id: 'corpo', label: 'Corpo', emoji: '🌿' },
    { id: 'relacoes', label: 'Relações', emoji: '❤️' },
    { id: 'casa_empresa', label: 'Casa ou empresa', emoji: '🏠' },
    { id: 'pet', label: 'Pet', emoji: '🐾' },
    { id: 'ansiedade', label: 'Ansiedade', emoji: '🌀' },
    { id: 'espiritual', label: 'Algo espiritual', emoji: '✨' },
    { id: 'luto', label: 'Luto', emoji: '🕊️' },
  ],
};

export const momentoQuestion: QuizQuestion<MomentoId> = {
  id: 'momento',
  pergunta: 'Como está isso hoje?',
  opcoes: [
    { id: 'comecando', label: 'Começando a incomodar' },
    { id: 'repete_tempo', label: 'Se repete há tempo' },
    { id: 'pesado', label: 'Está pesado, preciso de ajuda' },
  ],
};

export const historicoQuestion: QuizQuestion<HistoricoId> = {
  id: 'historico',
  pergunta: 'Você já fez algo com a Bruna?',
  opcoes: [
    { id: 'nenhum', label: 'Não' },
    { id: 'grupo_mesa', label: 'Jornada, Portal ou mesa' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'mentoria_caminho', label: 'Mentoria ou Caminho da Transformação' },
  ],
};

export const disposicaoQuestion: QuizQuestion<DisposicaoId> = {
  id: 'disposicao',
  pergunta: 'Neste momento, o que faz mais sentido pra você?',
  opcoes: [
    { id: 'acessivel', label: 'Começar com algo acessível' },
    { id: 'pontual', label: 'Tratar um tema pontual' },
    { id: 'acompanhamento', label: 'Um acompanhamento individual' },
    { id: 'intensivo', label: 'Um processo intensivo e concentrado' },
  ],
};

export const quizQuestions = [temaQuestion, momentoQuestion, historicoQuestion, disposicaoQuestion] as const;

/**
 * Temas cujo resultado no motor (`recommendationRules.ts`) é fixo — sempre a
 * mesma mesa avulsa, sem diagnóstico/mentoria correspondente — e por isso
 * ignora histórico e disposição por completo. Pra esses temas, o quiz pula
 * direto de "momento" (Q2) pra captura de lead (ver `QuizFlow.tsx`), sem
 * perguntar as duas últimas telas. Trade-off aceito: quem já concluiu
 * mentoria/Caminho e escolhe um desses temas não é desviado pra Sustentação
 * (a checagem de histórico existe, mas nunca dispara, porque a pergunta nem
 * é feita nesse caminho).
 */
export const SHORT_FLOW_TEMAS: readonly TemaId[] = ['luto', 'pet'];
