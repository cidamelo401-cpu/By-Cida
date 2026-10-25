import { RuledEntry } from './RuledEntry';
import { CtaButton } from './ui/CtaButton';

const pontos = [
  { numeral: '01', titulo: 'Dinheiro', texto: 'Eu trabalho, ganho, mas parece que nunca consigo avançar.' },
  { numeral: '02', titulo: 'Corpo', texto: 'Já tentei mudar hábitos, mas sinto que existe algo além do físico.' },
  { numeral: '03', titulo: 'Relacionamentos', texto: 'Os cenários mudam, mas alguns padrões continuam voltando.' },
  { numeral: '04', titulo: 'Negócio', texto: 'Minha empresa deveria estar avançando mais do que está.' },
  { numeral: '05', titulo: 'Emocional', texto: 'Existe algo se repetindo e eu não consigo entender exatamente de onde vem.' },
] as const;

export function PainPoints() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="label-margin mb-4 text-horizonte-600">Identificação</p>
      <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
        Talvez você já tenha percebido o padrão. Só ainda não encontrou a origem.
      </h2>

      <div className="mt-10 divide-y divide-noite-900/10">
        {pontos.map((p) => (
          <RuledEntry key={p.numeral} numeral={p.numeral} title={p.titulo}>
            {p.texto}
          </RuledEntry>
        ))}
      </div>

      <div className="mt-10">
        <CtaButton href="/quiz">Quero entender meu momento</CtaButton>
      </div>
    </section>
  );
}
