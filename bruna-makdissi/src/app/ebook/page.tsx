import type { Metadata } from 'next';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { RuledEntry } from '@/components/RuledEntry';
import { Disclaimer } from '@/components/Disclaimer';
import { CtaButton } from '@/components/ui/CtaButton';
import { getProductById } from '@/data/services';
import { buildWhatsappLink } from '@/data/whatsappTemplates';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Ebook Escassez Invisível — Bruna Makdissi',
  description: 'O ebook da Bruna sobre a escassez que se repete mesmo quando o dinheiro entra.',
  robots: { index: false, follow: false }, // trocar pra index:true só quando o conteúdo pendente abaixo estiver fechado
};

/**
 * Página de tráfego pago pro Ebook Escassez Invisível (E01), estrutura
 * inspirada na página de guia digital que a Cida trouxe como referência
 * (hero forte + identificação + método + sumário + autora + preço + FAQ).
 *
 * Tudo que é fato confirmado (services.ts E01, bio real em AboutBruna.tsx,
 * disclaimer já aprovado) está preenchido. Tudo que exigiria inventar
 * conteúdo do ebook em si (sumário, situações internas, método explicado,
 * perguntas de FAQ sem resposta conhecida, preço final, link de checkout)
 * está marcado com <Pendente> em vez de escrito — nunca deve virar texto
 * definitivo sem a Bruna mandar o conteúdo real.
 */

const PRECO_SUGERIDO = 37;

function Pendente({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-field border border-dashed border-horizonte-400 bg-horizonte-100/40 px-5 py-4">
      <p className="label-margin text-horizonte-700">Pendente — aguardando a Bruna</p>
      <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">{children}</p>
    </div>
  );
}

export default function EbookPage() {
  const produto = getProductById('E01')!;

  const mensagemWhatsapp = 'Oi, Bruna! Vi a página do Ebook Escassez Invisível e quero garantir o meu.';
  const whatsappHref = buildWhatsappLink(mensagemWhatsapp);

  return (
    <main>
      {/* HERO — único bloco noite-900 da página (design-system.md, 07) */}
      <section className="relative overflow-hidden bg-noite-900">
        <div className="relative mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-20 md:py-28">
          <Logo variant="escuro" className="h-8 w-auto" />

          <p className="label-margin text-ouro-300">Guia digital · Dinheiro</p>

          <h1 className="font-display text-3xl leading-tight text-nevoa-0 md:text-5xl">A escassez que ninguém vê</h1>

          <p className="font-display text-xl italic leading-snug text-horizonte-300 md:text-2xl">
            A que se repete mesmo quando o dinheiro entra.
          </p>

          <p className="max-w-xl font-body text-base font-light leading-relaxed text-noite-100">
            {produto.paraQueServe}
          </p>

          <div className="mt-2 flex flex-col items-start gap-3">
            <CtaButton href={whatsappHref}>Quero meu guia — R$ {PRECO_SUGERIDO}</CtaButton>
            <span className="label-margin text-noite-300">Preço e forma de pagamento a confirmar com a Bruna</span>
          </div>
        </div>
      </section>

      {/* VOCÊ SE RECONHECE AQUI — dores reais do catálogo (E01.doresPrincipais / desejos) */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">Você se reconhece aqui?</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
          Se algo disso soa familiar, o guia foi pensado pra você.
        </h2>

        <div className="mt-8 divide-y divide-noite-900/10">
          {produto.doresPrincipais.map((dor, i) => (
            <RuledEntry key={dor} numeral={String(i + 1).padStart(2, '0')} title={dor}>
              {dor === 'Escassez'
                ? 'A sensação se repete mesmo quando o dinheiro entra — não é sobre quanto você ganha.'
                : 'A relação com dinheiro pesa mais do que deveria, mesmo nos momentos em que as contas fecham.'}
            </RuledEntry>
          ))}
          <RuledEntry numeral="03" title="Clareza">
            Você quer entender de verdade o que está por trás disso, não só mais uma dica solta.
          </RuledEntry>
        </div>
      </section>

      {/* O MÉTODO — como o guia explica a escassez (pendente, não temos o texto real) */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">O método</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Como o guia explica a escassez invisível</h2>
        <div className="mt-6">
          <Pendente>
            Falta o texto real de como a Bruna explica a &ldquo;escassez invisível&rdquo; (a lógica por trás do
            conceito) — não vou inventar a explicação técnica/energética dela.
          </Pendente>
        </div>
      </section>

      {/* O QUE TEM DENTRO — sumário do ebook (pendente) */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">O que tem dentro</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Capítulos que levam você pela mão</h2>
        <div className="mt-6">
          <Pendente>
            Falta o sumário real (capítulos ou situações abordadas). A Bruna já sinalizou que o conteúdo está
            finalizado — só falta ela mandar essa estrutura pra virar copy aqui.
          </Pendente>
        </div>
      </section>

      {/* QUEM ESCREVE — bio real da Bruna, já aprovada em AboutBruna.tsx */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr] md:items-start">
          <div className="relative aspect-[2/3] w-full max-w-[240px] overflow-hidden rounded-card shadow-md md:max-w-none">
            <Image
              src="/bruna/bruna-sozinha-look-bege-01.jpg"
              alt="Bruna Makdissi"
              fill
              sizes="(min-width: 768px) 260px, 240px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="label-margin mb-4 text-horizonte-600">Quem escreve</p>
            <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
              Eu saí da escassez. <em className="text-horizonte-600">É daí que eu ensino.</em>
            </h2>
            <div className="mt-6 space-y-4 font-body text-sm font-light leading-relaxed text-tinta-700">
              <p>
                Sou <strong className="font-medium text-noite-900">Bruna Makdissi</strong>, bióloga, naturopata
                holística e desprogramadora neurobiológica. Hoje sou mentora financeira e energética.
              </p>
              <p>
                Sou sensitiva e trabalho com a percepção do campo energético de pessoas e lugares. Uno esse olhar à
                minha formação sem misturar uma coisa com a outra: a biologia me deu método, a espiritualidade me deu
                profundidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRA QUEM É / PREÇO */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">Pra quem é (e pra quem não é)</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Um recado honesto antes de você comprar</h2>

        <div className="mt-6 space-y-4">
          <div>
            <p className="label-margin text-tinta-500">Este guia é pra você que</p>
            <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">{produto.paraQuemE}</p>
          </div>
          <Pendente>
            &ldquo;Pra quem não é&rdquo; ainda está em branco no catálogo (paraQuemNaoE = &ldquo;—&rdquo;) — a Bruna
            precisa definir isso antes de publicar, pra não gerar expectativa errada.
          </Pendente>
        </div>

        <div className="mt-10 rounded-card border border-noite-900/10 bg-nevoa-100 p-6 md:p-8">
          <p className="font-display text-3xl text-noite-900">
            R$ {PRECO_SUGERIDO}
            <span className="ml-2 font-body text-sm font-normal text-tinta-500">(sugestão — a confirmar)</span>
          </p>
          <ul className="mt-4 space-y-2 font-body text-sm text-tinta-700">
            <li>✓ {produto.oQueRecebe}</li>
          </ul>
          <div className="mt-6">
            <CtaButton href={whatsappHref} className="w-full">
              Quero meu guia — R$ {PRECO_SUGERIDO}
            </CtaButton>
          </div>
          <p className="mt-3 font-body text-xs text-tinta-500">
            Ainda sem checkout — o botão acima leva pro WhatsApp reservar com a Bruna.
          </p>
        </div>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </section>

      {/* FAQ — só perguntas com resposta real conhecida */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">Perguntas frequentes</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Antes de você decidir</h2>

        <div className="mt-8 divide-y divide-noite-900/10">
          <RuledEntry numeral="01" title="O guia é um PDF? Recebo na hora?">
            Sim, é um PDF ({produto.oQueRecebe}). A entrega automática depende do link de checkout, que ainda não
            existe — hoje o contato é feito direto com a Bruna pelo WhatsApp.
          </RuledEntry>
          <RuledEntry numeral="02" title="Isso substitui acompanhamento profissional?">
            Não. Veja o aviso abaixo, que vale para todos os atendimentos e materiais da Bruna.
          </RuledEntry>
        </div>

        <div className="mt-6">
          <Pendente>
            Outras perguntas (garantia, quantidade de conteúdo, pré-requisitos) dependem do conteúdo final do ebook —
            só entram aqui depois que a Bruna mandar o sumário e revisar os 3 trechos com &ldquo;cura&rdquo; que ela
            já sinalizou no catálogo.
          </Pendente>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Respira fundo. Seu guia está a um clique.</h2>
        <div className="mt-8 flex justify-center">
          <CtaButton href={whatsappHref}>Quero começar agora — R$ {PRECO_SUGERIDO}</CtaButton>
        </div>
      </section>

      <footer className="border-t border-noite-900/10 bg-nevoa-100">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Logo variant="claro" className="h-8 w-auto" />
          <div className="mt-6 flex flex-col gap-1 font-body text-sm text-tinta-700">
            <a href={`mailto:${site.email}`} className="hover:text-horizonte-600">
              {site.email}
            </a>
            <a href={site.instagramUrl} className="hover:text-horizonte-600">
              {site.instagram}
            </a>
          </div>
          <p className="mt-6 font-body text-xs text-tinta-400">
            © {new Date().getFullYear()} Bruna Makdissi · {site.tagline}
          </p>
        </div>
      </footer>
    </main>
  );
}
