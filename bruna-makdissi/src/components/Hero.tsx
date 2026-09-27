import Image from 'next/image';
import { Logo } from './Logo';
import { CtaButton } from './ui/CtaButton';

/**
 * A capa — o único momento alto (bloco noite-900) desta página inteira
 * (design-system.md, seção 07). Nenhum outro componente da landing pode
 * repetir o fundo noite.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-noite-900">
      <Image
        src="/brand/simbolo-oficial.png"
        alt=""
        width={1200}
        height={1225}
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-[140%] w-auto max-w-none opacity-10 md:-right-40"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <Logo variant="escuro" className="h-9 w-auto md:h-10" />

        <h1 className="font-display text-4xl leading-tight text-nevoa-0 md:text-5xl">
          O que está pedindo atenção na sua vida hoje?
        </h1>

        <p className="max-w-xl font-body font-light text-base text-noite-100 md:text-lg">
          Às vezes você sabe que algo se repete, pesa ou parece travado, mas ainda não sabe por onde começar.
        </p>

        <div className="flex flex-col items-start gap-3">
          <CtaButton href="/quiz">Descobrir meu caminho</CtaButton>
          <span className="label-margin text-noite-300">Responda algumas perguntas. Leva poucos minutos.</span>
        </div>
      </div>
    </section>
  );
}
