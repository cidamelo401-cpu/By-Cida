import { RuledEntry } from './RuledEntry';

const passos = [
  {
    numeral: '01',
    titulo: 'Você responde',
    texto: 'Algumas perguntas sobre o momento que está vivendo.',
  },
  {
    numeral: '02',
    titulo: 'A experiência organiza',
    texto: 'Nas suas respostas, identificamos qual área aparece com mais força agora.',
  },
  {
    numeral: '03',
    titulo: 'Você recebe um caminho',
    texto: 'Mostramos qual atendimento da Bruna pode ser um bom primeiro passo para aprofundar essa questão.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="label-margin mb-4 text-horizonte-600">Como funciona</p>
      <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
        Três passos, sem enrolação.
      </h2>

      <div className="mt-10 divide-y divide-noite-900/10">
        {passos.map((p) => (
          <RuledEntry key={p.numeral} numeral={p.numeral} title={p.titulo}>
            {p.texto}
          </RuledEntry>
        ))}
      </div>
    </section>
  );
}
