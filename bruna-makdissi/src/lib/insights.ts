import { temaQuestion, historicoQuestion } from '@/data/questions';
import type { QuizAnswers, MomentoId, DisposicaoId } from '@/data/types';

/**
 * Gera os bullets curtos usados só na mensagem privada de WhatsApp (contexto
 * pra Bruna, não aparece na tela) — sempre atribuído à escolha da pessoa,
 * nunca uma afirmação declarativa sobre o estado dela (regra Verde de
 * claims-e-safety.md).
 */
export function getAnswerInsights(answers: QuizAnswers): string[] {
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === answers.tema)?.label ?? answers.tema;
  const momentoLabel = MOMENTO_LABEL[answers.momento];
  const historicoLabel = historicoQuestion.opcoes.find((o) => o.id === answers.historico)?.label ?? answers.historico;

  const bullets = [
    `O tema que mais pede atenção agora, na sua resposta: ${temaLabel}.`,
    `Como você descreveu o momento: "${momentoLabel}".`,
  ];

  if (answers.historico !== 'nenhum') {
    bullets.push(`Você contou que já passou por: ${historicoLabel} com a Bruna.`);
  }

  // Luto pula histórico/disposição no quiz (ver QuizFlow) — não inventar uma
  // resposta que a pessoa nunca deu.
  if (answers.tema !== 'luto') {
    const disposicaoLabel = DISPOSICAO_LABEL[answers.disposicao];
    bullets.push(`O que faz mais sentido pra você agora: "${disposicaoLabel}".`);
  }

  return bullets;
}

const MOMENTO_LABEL: Record<MomentoId, string> = {
  comecando: 'Começando a incomodar',
  repete_tempo: 'Se repete há tempo',
  pesado: 'Está pesado, preciso de ajuda',
};

const DISPOSICAO_LABEL: Record<DisposicaoId, string> = {
  acessivel: 'Começar com algo acessível',
  pontual: 'Tratar um tema pontual',
  acompanhamento: 'Um acompanhamento individual',
  intensivo: 'Um processo intensivo e concentrado',
};

/** Continuação gramatical natural para o parágrafo de justificativa — não é o rótulo do quiz. */
const MOMENTO_PHRASE: Record<MomentoId, string> = {
  comecando: 'está começando a incomodar',
  repete_tempo: 'se repete há um tempo',
  pesado: 'está pesado, e você sente que precisa de ajuda com isso',
};

const DISPOSICAO_PHRASE: Record<DisposicaoId, string> = {
  acessivel: 'começar com algo mais leve, sem grande compromisso',
  pontual: 'tratar isso em um atendimento pontual',
  acompanhamento: 'ter um acompanhamento mais próximo',
  intensivo: 'ter um processo mais intensivo e concentrado',
};

const HISTORICO_PHRASE: Partial<Record<QuizAnswers['historico'], string>> = {
  grupo_mesa: ' Você também contou que já passou por uma jornada, um portal ou uma mesa com a Bruna antes.',
  diagnostico: ' Você também contou que já fez um diagnóstico com a Bruna.',
};

/**
 * O texto visível na tela de resultado — uma justificativa em prosa, nunca
 * a lista crua das respostas marcadas. Ainda segue a regra de atribuir à
 * resposta da pessoa ("você contou que"), só que como copy corrida, não bullets.
 */
export function getResultJustification(answers: QuizAnswers): string {
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === answers.tema)?.label ?? answers.tema;
  const momentoPhrase = MOMENTO_PHRASE[answers.momento];
  const historicoAddendum = HISTORICO_PHRASE[answers.historico] ?? '';

  // Luto pula histórico/disposição no quiz (ver QuizFlow) — a frase não pode
  // citar uma resposta de disposição que a pessoa nunca deu.
  if (answers.tema === 'luto') {
    return `Nas suas respostas, luto apareceu como o que mais pede atenção agora — algo que ${momentoPhrase}.`;
  }

  const disposicaoPhrase = DISPOSICAO_PHRASE[answers.disposicao];

  return `Nas suas respostas, ${temaLabel.toLowerCase()} apareceu como o que mais pede atenção agora — algo que ${momentoPhrase}.${historicoAddendum} Diante disso, o que parece fazer mais sentido é ${disposicaoPhrase}.`;
}
