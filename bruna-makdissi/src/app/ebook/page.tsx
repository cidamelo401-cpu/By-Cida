import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';
import { CtaButton } from '@/components/ui/CtaButton';
import { getProductById } from '@/data/services';
import { buildWhatsappLink } from '@/data/whatsappTemplates';

export const metadata: Metadata = {
  title: 'Ebook Escassez Invisível — Bruna Makdissi',
  robots: { index: false, follow: false },
};

/**
 * ESQUELETO — layout inspirado na página de guia digital que a Cida trouxe
 * como referência (headline + bullets + preço fixo + CTA único). Texto usa
 * só o que já existe em services.ts (E01); nada foi inventado sobre o
 * conteúdo do ebook em si.
 *
 * Pendências reais antes de publicar (ver services.ts, E01):
 * - preco.mode ainda é 'a_definir' — R$37 abaixo é sugestão, não confirmado.
 * - "Três trechos com 'cura' serão reformulados antes da publicação" (nota
 *   da própria Bruna no catálogo) — sobre o PDF, não sobre esta página.
 * - Sem link de checkout ainda, então o CTA vai pro WhatsApp reservar.
 */

const PRECO_SUGERIDO = 37;

export default function EbookPage() {
  const produto = getProductById('E01')!;

  const mensagemWhatsapp = [
    'Oi, Bruna! Vi a página do Ebook Escassez Invisível e quero garantir o meu.',
  ].join('\n');

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-xl px-6 py-16">
        <Logo variant="claro" className="mb-10 h-7 w-auto" />
        <p className="label-margin text-horizonte-600">Esqueleto — preço e link de compra ainda não confirmados</p>

        <p className="label-margin mt-8 text-tinta-500">Guia digital · Dinheiro</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-noite-900 md:text-4xl">
          A escassez que ninguém vê
        </h1>
        <p className="mt-3 font-display text-lg italic leading-snug text-horizonte-600">
          A que se repete mesmo quando o dinheiro entra.
        </p>

        <p className="mt-6 font-body text-base font-light leading-relaxed text-tinta-700">{produto.paraQueServe}</p>

        <div className="mt-10 space-y-6 border-t border-noite-900/10 pt-8">
          <div>
            <p className="label-margin text-tinta-500">O que você recebe</p>
            <p className="mt-1 font-body text-sm text-noite-900">{produto.oQueRecebe}</p>
          </div>
          <div>
            <p className="label-margin text-tinta-500">Pra quem é</p>
            <p className="mt-1 font-body text-sm text-noite-900">{produto.paraQuemE}</p>
          </div>
        </div>

        <div className="mt-10 rounded-card border border-noite-900/10 bg-nevoa-0 p-6">
          <p className="font-display text-2xl text-noite-900">
            R$ {PRECO_SUGERIDO}
            <span className="ml-2 font-body text-xs font-normal text-tinta-500">(sugestão — a confirmar)</span>
          </p>
          <div className="mt-4">
            <CtaButton href={buildWhatsappLink(mensagemWhatsapp)} className="w-full">
              Quero receber o ebook
            </CtaButton>
          </div>
        </div>

        {produto.proximoPassoNatural && (
          <p className="mt-6 font-body text-xs text-tinta-500">
            Passo natural depois do ebook: {produto.proximoPassoNatural}
          </p>
        )}
      </div>
    </main>
  );
}
