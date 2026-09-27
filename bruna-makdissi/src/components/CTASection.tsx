import { CtaButton } from './ui/CtaButton';

export function CTASection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
        Você não precisa saber qual atendimento escolher.
      </h2>
      <p className="mx-auto mt-3 max-w-md font-body font-light text-tinta-700">
        Comece contando o que está acontecendo.
      </p>
      <div className="mt-8 flex justify-center">
        <CtaButton href="/quiz">Fazer meu direcionamento</CtaButton>
      </div>
    </section>
  );
}
