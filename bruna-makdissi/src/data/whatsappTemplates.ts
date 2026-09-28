/**
 * Geração da mensagem de WhatsApp a partir do resultado do quiz.
 *
 * A mensagem é composta pela própria cliente antes de enviar (ela abre o
 * WhatsApp com o texto pré-preenchido e pode editar) — por isso só entra
 * aqui o que faz sentido a cliente mandar pra Bruna: tema e produto(s).
 * Nunca entra: resposta bruta e sensível de momento/histórico, nem qualquer
 * raciocínio interno de como o site chegou nesse resultado (isso é o que
 * `nextStepNote` guarda pra mostrar só na tela — ver `types.ts`).
 */

import { getProductById } from './services';
import { temaQuestion } from './questions';
import type { RecommendationResult, TemaId } from './types';

export const WHATSAPP_NUMBER = '5511951273317'; // +55 11 95127-3317, formato E.164 sem símbolos

export function buildWhatsappMessage(temaId: TemaId, resultado: RecommendationResult): string {
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

  linhas.push('', 'Quero entender melhor qual pode ser o meu próximo passo.');

  return linhas.join('\n');
}

export function buildWhatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
