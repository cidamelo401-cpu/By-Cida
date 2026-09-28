import { getResultContent } from '@/data/resultContent';

type RecommendationCardProps = {
  productId: string;
};

/**
 * Card de produto "avulso" — usado só quando o resultado tem mais de um
 * produto ao mesmo tempo (hoje: o trio de mesas espirituais). Mostra nome,
 * explicação, como funciona, investimento e cuidado, sem repetir o bloco de
 * "seu direcionamento" / "entendendo esse momento" / insights pra cada um —
 * esses ficam só na página quando há um único produto (ver ResultadoView).
 */
export function RecommendationCard({ productId }: RecommendationCardProps) {
  const content = getResultContent(productId);
  if (!content) return null;

  return (
    <div className="border-t border-noite-900/10 pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-display text-xl text-noite-900">{content.productHeading}</h3>

      {content.productExplanation.map((paragrafo, i) => (
        <p key={i} className="mt-2 font-body text-sm font-light leading-relaxed text-tinta-700">
          {paragrafo}
        </p>
      ))}

      <ul className="mt-3 space-y-1">
        {content.comoFunciona.map((linha) => (
          <li key={linha} className="font-body text-xs text-tinta-500">
            {linha}
          </li>
        ))}
      </ul>

      {content.investimento?.map((linha, i) => (
        <p key={i} className={i === 0 ? 'mt-3 font-body text-sm font-medium text-noite-900' : 'mt-1 font-body text-xs font-light text-tinta-500'}>
          {linha}
        </p>
      ))}

      {content.disponibilidade?.map((linha, i) => (
        <p key={i} className="mt-1 font-body text-xs font-light text-tinta-500">
          {linha}
        </p>
      ))}

      {content.cuidado && <p className="mt-3 font-body text-xs font-light leading-relaxed text-tinta-500">{content.cuidado}</p>}
    </div>
  );
}
