import { temaQuestion, momentoQuestion, historicoQuestion, disposicaoQuestion } from '@/data/questions';
import type { QuizAnswers } from '@/data/types';

/**
 * Gera os bullets de "o que apareceu nas suas respostas" — sempre atribuído
 * à escolha da pessoa, nunca uma afirmação declarativa sobre o estado dela
 * (regra Verde de claims-e-safety.md: "nas suas respostas, este foi..." em
 * vez de "suas emoções pedem X").
 */
export function getAnswerInsights(answers: QuizAnswers): string[] {
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === answers.tema)?.label ?? answers.tema;
  const momentoLabel = momentoQuestion.opcoes.find((o) => o.id === answers.momento)?.label ?? answers.momento;
  const historicoLabel = historicoQuestion.opcoes.find((o) => o.id === answers.historico)?.label ?? answers.historico;
  const disposicaoLabel = disposicaoQuestion.opcoes.find((o) => o.id === answers.disposicao)?.label ?? answers.disposicao;

  const bullets = [
    `O tema que mais pede atenção agora, na sua resposta: ${temaLabel}.`,
    `Como você descreveu o momento: "${momentoLabel}".`,
    `O que faz mais sentido pra você agora: "${disposicaoLabel}".`,
  ];

  if (answers.historico !== 'nenhum') {
    bullets.splice(2, 0, `Você contou que já passou por: ${historicoLabel} com a Bruna.`);
  }

  return bullets;
}
