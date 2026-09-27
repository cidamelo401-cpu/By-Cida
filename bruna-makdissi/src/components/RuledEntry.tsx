import type { ReactNode } from 'react';

type RuledEntryProps = {
  numeral: string;
  title: string;
  children: ReactNode;
};

/**
 * O elemento de assinatura da marca — "entrada pautada" (design-system.md, seção 06).
 * Substitui o card genérico: numeral em ouro na margem, pauta de 26px sob o
 * conteúdo, nunca um cartão com sombra.
 */
export function RuledEntry({ numeral, title, children }: RuledEntryProps) {
  return (
    <div
      className="grid grid-cols-[56px_1fr] gap-4 px-6 py-8 md:px-8"
      style={{
        backgroundImage: 'linear-gradient(rgba(35,27,56,.065) 1px, transparent 1px)',
        backgroundSize: '100% 26px',
        backgroundPosition: '0 25px',
      }}
    >
      <span className="font-display text-3xl text-ouro-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {numeral}
      </span>
      <div>
        <h3 className="font-display text-xl text-noite-900 mb-2">{title}</h3>
        <p className="font-body font-light text-sm leading-relaxed text-tinta-700">{children}</p>
      </div>
    </div>
  );
}
