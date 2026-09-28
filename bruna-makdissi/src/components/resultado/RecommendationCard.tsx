import type { Product } from '@/data/types';
import { formatPrice, formatPacote } from '@/lib/price';

type RecommendationCardProps = {
  produto: Product;
};

/**
 * Um único produto do resultado — nunca mostra preço quando
 * preco.mode === 'sob_consulta' (regra do catálogo), só o CTA.
 */
export function RecommendationCard({ produto }: RecommendationCardProps) {
  const preco = formatPrice(produto.preco);
  const pacote = formatPacote(produto.preco);

  return (
    <div className="border-t border-noite-900/10 pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-display text-xl text-noite-900">{produto.nome}</h3>
      <p className="mt-2 font-body text-sm font-light leading-relaxed text-tinta-700">{produto.paraQueServe}</p>
      <p className="mt-3 font-body text-xs text-tinta-500">{produto.duracaoRitmo}</p>

      {preco && <p className="mt-3 font-body text-sm font-medium text-noite-900">{preco}</p>}
      {pacote && <p className="mt-1 font-body text-xs font-light text-tinta-500">{pacote}</p>}
      {!preco && <p className="mt-3 font-body text-xs font-light text-tinta-500">{produto.disponibilidade}</p>}
    </div>
  );
}
