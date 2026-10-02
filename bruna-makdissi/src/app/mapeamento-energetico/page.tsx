import type { Metadata } from 'next';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { CtaButton } from '@/components/ui/CtaButton';
import { buildWhatsappLink } from '@/data/whatsappTemplates';

export const metadata: Metadata = {
  title: 'Vale-presente — Mapeamento Energético · Bruna Makdissi',
  description: 'Você ganhou um mapeamento energético individual, online, com a Bruna Makdissi.',
  robots: { index: false, follow: false },
};

/**
 * Página de vale-presente do Mapeamento Energético — recriação da peça
 * gráfica que a Cida já tinha (ver anexo), mas com o CTA virando um link de
 * verdade pro WhatsApp em vez de um botão só visual numa imagem estática.
 *
 * Conteúdo (descrição do diagnóstico, as 3 áreas, preço de R$350, a frase
 * "eu não te ensino... eu te ensino porque saí dela") vem literalmente do
 * PDF "Mapeamento Energético" que a Cida mandou — nada inventado.
 */

const AREAS = [
  { label: 'Saúde', msg: 'saúde' },
  { label: 'Dinheiro', msg: 'dinheiro' },
  { label: 'Amor', msg: 'amor' },
] as const;

function linkParaArea(area?: string) {
  const base = 'Oi, Bruna! Ganhei o mapeamento energético de presente e quero agendar a minha sessão.';
  const msg = area ? `${base} Quero olhar a área: ${area}.` : base;
  return buildWhatsappLink(msg);
}

export default function MapeamentoEnergeticoPage() {
  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <Logo variant="claro" className="mb-8 h-16 w-auto md:h-20" />
            <p className="label-margin flex items-center gap-2 text-ouro-600">
              <span className="h-px w-6 bg-ouro-500" /> Vale-presente
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight text-noite-900 md:text-4xl">
              Você ganhou um mapeamento <em className="text-horizonte-600">energético.</em>
            </h1>
            <p className="mt-5 font-body text-base font-light leading-relaxed text-tinta-700">
              Um encontro individual, online, que normalmente é pago. Hoje ele é meu presente para você.
            </p>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card shadow-lg">
            <Image
              src="/bruna/bruna-sozinha-look-bege-01.jpg"
              alt="Bruna Makdissi"
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="mt-12 rounded-card border border-noite-900/10 bg-nevoa-0 p-6 shadow-md md:p-8">
          <p className="label-margin mb-4 text-tinta-500">Lançamento</p>
          <div className="divide-y divide-noite-900/10">
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="flex items-center gap-3 font-body text-sm text-noite-900">
                <span className="font-display text-base text-ouro-500">01</span>
                Mapeamento energético individual, online
              </span>
              <span className="whitespace-nowrap font-body text-sm text-noite-900">R$ 350,00</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="flex items-center gap-3 font-body text-sm text-noite-900">
                <span className="font-display text-base text-ouro-500">02</span>
                Presente da Bruna para este grupo
              </span>
              <span className="whitespace-nowrap font-body text-sm text-tinta-500">– R$ 350,00</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="flex items-center gap-3 font-body text-sm font-medium text-noite-900">
                <span className="font-display text-base text-ouro-500">03</span>
                Você investe
              </span>
              <span className="whitespace-nowrap font-body text-sm text-noite-900">
                <em className="font-display italic text-ouro-600">só</em> o seu tempo
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="font-display text-sm italic text-tinta-700">Você escolhe por onde começar:</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {AREAS.map((a) => (
              <a
                key={a.label}
                href={linkParaArea(a.msg)}
                className="rounded-pill border border-noite-900/15 bg-nevoa-0 px-5 py-2 font-body text-sm text-noite-900 transition-colors hover:border-horizonte-400 hover:text-horizonte-600"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <CtaButton href={linkParaArea()}>Me chama no WhatsApp</CtaButton>
          <p className="font-body text-sm font-light leading-snug text-tinta-700">
            Abro poucos horários por vez, para atender cada pessoa com calma.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-noite-900/10 pt-8 md:flex-row md:items-end">
          <p className="max-w-sm font-display text-base italic leading-snug text-noite-900">
            Eu não te ensino a sair da escassez porque estudei sobre ela. Eu te ensino porque saí dela.
          </p>
          <Logo variant="claro" className="h-16 w-auto" />
        </div>
      </div>
    </main>
  );
}
