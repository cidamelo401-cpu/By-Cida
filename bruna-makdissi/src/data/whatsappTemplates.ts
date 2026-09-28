/**
 * Geração da mensagem de WhatsApp a partir do resultado do quiz.
 *
 * Regra do catálogo: nunca enviar respostas sensíveis inteiras — só categoria e
 * resultado (produto recomendado), nunca o conteúdo bruto das respostas de
 * momento/histórico. O texto livre digitado pela pessoa (se algum campo permitir)
 * nunca deve compor a mensagem automaticamente sem revisão.
 */

import { getProductById } from './services';
import { temaQuestion } from './questions';
import type { RecommendationResult, TemaId } from './types';

export const WHATSAPP_NUMBER = '5511951273317'; // +55 11 95127-3317, formato E.164 sem símbolos

/**
 * insights: opcional, até 2 linhas curtas do que a pessoa respondeu (ver
 * getInsightsFor em data/resultContent.ts) — nunca a resposta bruta e
 * sensível, só o resumo que já aparece na própria tela de resultado.
 */
export function buildWhatsappMessage(temaId: TemaId, resultado: RecommendationResult, insights?: string[]): string {
  const temaLabel = temaQuestion.opcoes.find((o) => o.id === temaId)?.label ?? temaId;

  if (resultado.isDiffuse || resultado.primaryProductIds.length === 0) {
    return [
      'Oi, Bruna! Fiz o direcionamento no site.',
      '',
      `O tema que mais apareceu foi: ${temaLabel}.`,
      'Meu resultado não apontou um único produto — quero entender com você qual pode ser o meu primeiro passo.',
    ].join('\n');
  }

  const produtos = resultado.primaryProductIds.map(getProductById).filter(Boolean);
  const nomesProdutos = produtos.map((p) => p!.nome).join(' ou ');

  const linhas = ['Oi, Bruna! Fiz o direcionamento no site.', ''];

  if (resultado.requiresWhatsappToChoose && produtos.length > 1) {
    linhas.push(`O tema que apareceu foi: ${temaLabel}.`, `Fiquei entre estas opções: ${nomesProdutos}.`, 'Pode me ajudar a escolher a certa?');
  } else {
    linhas.push(`Meu resultado principal foi: ${nomesProdutos}.`);
  }

  if (insights && insights.length > 0) {
    linhas.push('', 'Alguns pontos que apareceram:', ...insights.slice(0, 2).map((i) => `- ${i}`));
  }

  if (resultado.nextStepNote) {
    linhas.push('', resultado.nextStepNote);
  }

  linhas.push('', 'Quero entender melhor qual pode ser o meu próximo passo.');

  return linhas.join('\n');
}

export function buildWhatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
