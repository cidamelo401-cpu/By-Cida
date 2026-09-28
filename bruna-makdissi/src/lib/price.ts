import type { PriceInfo } from '@/data/types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Nunca retorna texto para preco.mode === 'sob_consulta' — essa regra vem
 * direto do catálogo ("SOB CONSULTA... não mostrar valor em nenhum
 * material"). O componente que chama isso deve tratar `null` mostrando só o
 * CTA, nunca um valor.
 */
export function formatPrice(preco: PriceInfo): string | null {
  if (preco.mode !== 'publico' || preco.valor === undefined) return null;

  if (preco.temVersaoGravada && preco.valorGravado !== undefined) {
    return `${brl.format(preco.valor)} ao vivo · ${brl.format(preco.valorGravado)} gravado`;
  }

  return brl.format(preco.valor);
}

export function formatPacote(preco: PriceInfo): string | null {
  if (!preco.pacote) return null;
  return `Também disponível em pacote de ${preco.pacote.sessoes} sessões por ${brl.format(preco.pacote.valor)}.`;
}
