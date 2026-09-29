import type { Metadata } from 'next';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { Disclaimer } from '@/components/Disclaimer';
import { CtaButton } from '@/components/ui/CtaButton';
import { getProductById } from '@/data/services';
import { buildWhatsappLink } from '@/data/whatsappTemplates';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Escassez Invisível — Bruna Makdissi',
  description: 'Um guia completo para reprogramar o sistema operacional da sua vida — dinheiro, tempo, energia, corpo, relações e mais.',
  robots: { index: false, follow: false }, // trocar pra index:true só quando preço e checkout estiverem fechados
};

/**
 * Página de tráfego pago pro ebook "Escassez Invisível" (E01).
 *
 * Todo o conteúdo abaixo (índice de crise, estrutura dos 12 capítulos + parte
 * prática, o método de 6 passos, a bio da autora) vem literalmente do PDF do
 * ebook que a Bruna mandou — não foi inventado nada. Só o preço final e o
 * link de checkout continuam pendentes (catálogo E01 ainda marca
 * preco.mode = 'a_definir').
 *
 * Nota pra Cida/Bruna: o catálogo classifica E01 só como tema "Dinheiro",
 * mas o livro cobre 12 áreas (tempo, energia, corpo, relações, medo, morte,
 * visibilidade, merecimento, prazer, identidade, espiritualidade). Vale
 * ajustar o catálogo — aqui na página eu descrevi o escopo real.
 */

const PRECO_SUGERIDO = 59;

function Pendente({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-field border border-dashed border-horizonte-400 bg-horizonte-100/40 px-5 py-4">
      <p className="label-margin text-horizonte-700">Pendente — aguardando a Bruna</p>
      <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">{children}</p>
    </div>
  );
}

const RECONHECIMENTO = [
  'Não tenho dinheiro suficiente / não mereço cobrar',
  'Não tenho tempo para nada / estou sempre atrasada',
  'Estou exausta / não consigo parar / me sinto culpada por descansar',
  'Como compulsivamente / meu corpo não responde / me sinto pesada',
  'Tenho medo de perder o amor / ciúme / preciso de confirmação constante',
  'Estou paralisada pelo medo / não consigo agir',
  'Tenho medo de mudar / não consigo soltar o que já passou',
  'Não consigo aparecer / tenho vergonha de me mostrar',
  'Não me sinto merecedora / aceito menos do que valho',
  'Não consigo sentir prazer / estou sempre em modo sobrevivência',
  'Não sei mais quem sou / me perco tentando agradar a todos',
  'Sinto que o universo não me apoia / que a abundância é para os outros',
] as const;

const METODO = [
  { n: '01', t: 'Reconhecer', d: 'O conceito. Onde essa escassez vive. Como ela se disfarça.' },
  { n: '02', t: 'Sentir', d: 'História real. O momento em que você se reconhece.' },
  { n: '03', t: 'Entender', d: 'A neurociência por trás, explicada de forma humana.' },
  { n: '04', t: 'Interromper', d: 'O exercício prático. O treino de sobreescrita.' },
  { n: '05', t: 'Reprogramar', d: 'O mantra. A prática de vigília. A série de repetição.' },
  { n: '06', t: 'Novo normal', d: 'Como esse campo transformado se parece na vida real.' },
] as const;

const PARTE1 = [
  { n: '01', t: 'Escassez Financeira', s: 'O sintoma que todo mundo vê mas quase ninguém cura' },
  { n: '02', t: 'Escassez de Tempo', s: '"Não tenho tempo" como identidade disfarçada de produtividade' },
  { n: '03', t: 'Escassez de Energia', s: 'Dar até esvaziar como virtude disfarçada' },
];

const PARTE2 = [
  { n: '04', t: 'Escassez no Corpo', s: 'Quando o corpo guarda o que a mente teme perder' },
  { n: '05', t: 'Escassez nas Relações', s: 'Quando agradar o mundo inteiro te afasta de você mesma' },
  { n: '06', t: 'Escassez e o Medo', s: 'O gerente invisível de todas as suas decisões' },
  { n: '07', t: 'Escassez e a Morte', s: 'O que você evita a vida inteira está acontecendo dentro de você agora' },
  { n: '08', t: 'Escassez de Visibilidade', s: 'Se esconder como proteção — e o preço invisível da invisibilidade' },
  { n: '09', t: 'Escassez de Merecimento', s: 'Cobrar barato, aceitar menos, agradecer pelo pouco' },
  { n: '10', t: 'Escassez de Prazer', s: 'Viver em modo sobrevivência disfarçado de produtividade' },
  { n: '11', t: 'Escassez de Identidade', s: 'Ser quem os outros precisam — e perder quem você é' },
  { n: '12', t: 'Escassez de Espiritualidade', s: 'Acreditar que o universo tem pouco para te dar' },
];

export default function EbookPage() {
  const produto = getProductById('E01')!;
  const mensagemWhatsapp = 'Oi, Bruna! Vi a página do ebook Escassez Invisível e quero garantir o meu.';
  const whatsappHref = buildWhatsappLink(mensagemWhatsapp);

  return (
    <main>
      {/* HERO — único bloco noite-900 da página */}
      <section className="relative overflow-hidden bg-noite-900">
        <div className="relative mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-20 md:py-28">
          <Logo variant="escuro" className="h-8 w-auto" />
          <p className="label-margin text-ouro-300">Guia digital · Consciência e transformação</p>
          <h1 className="font-display text-4xl leading-tight text-nevoa-0 md:text-6xl">Escassez invisível</h1>
          <p className="font-display text-xl italic leading-snug text-horizonte-300 md:text-2xl">
            Ela está em todo lugar que você ainda não olhou — um guia completo para reprogramar o sistema
            operacional da sua vida.
          </p>
          <p className="max-w-xl font-body text-base font-light leading-relaxed text-noite-100">
            A escassez não mora só na conta bancária. Mora na forma como você ama, como você aparece, como você
            descansa, como você cobra pelo seu trabalho. Este guia é um convite a olhar — não para se punir pelo que
            encontrar, mas para reprogramar com intenção, neurociência e espiritualidade o que não precisa mais te
            governar.
          </p>
          <div className="mt-2 flex flex-col items-start gap-3">
            <CtaButton href={whatsappHref}>Quero meu guia — R$ {PRECO_SUGERIDO}</CtaButton>
            <span className="label-margin text-noite-300">Preço e forma de pagamento a confirmar com a Bruna</span>
          </div>
        </div>
      </section>

      {/* VOCÊ SE RECONHECE AQUI — índice de crise real do ebook (apêndice 04) */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">Você se reconhece aqui?</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
          O próprio guia tem um índice para isso: &ldquo;estou sentindo isso agora — para onde vou?&rdquo;
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {RECONHECIMENTO.map((frase) => (
            <div key={frase} className="rounded-field border border-noite-900/10 bg-nevoa-100 px-4 py-3">
              <p className="font-body text-sm font-light leading-snug text-tinta-700">&ldquo;{frase}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* O MÉTODO — real: cada capítulo segue o mesmo ritual de 6 passos */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">O método</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Cada capítulo é um ritual</h2>
        <p className="mt-3 font-body text-sm font-light leading-relaxed text-tinta-700">
          Uma estrutura que se repete — criando o ritmo de uma prática, não apenas de uma leitura. Neurociência de um
          lado, sensibilidade energética do outro. Nunca um sem o outro.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3">
          {METODO.map((m) => (
            <div key={m.n}>
              <span className="font-display text-2xl text-ouro-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {m.n}
              </span>
              <p className="mt-1 font-body text-sm font-medium uppercase tracking-wide text-noite-900">{m.t}</p>
              <p className="mt-1 font-body text-xs font-light leading-relaxed text-tinta-500">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O QUE TEM DENTRO — sumário real dos 12 capítulos + parte prática */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">O que tem dentro</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">12 capítulos, uma jornada completa</h2>

        <p className="mt-4 label-margin text-tinta-500">Parte 1 — Os lugares óbvios</p>
        <div className="mt-3 divide-y divide-noite-900/10 border-t border-noite-900/10">
          {PARTE1.map((c) => (
            <div key={c.n} className="grid grid-cols-[40px_1fr] gap-3 py-4">
              <span className="font-display text-lg text-ouro-500">{c.n}</span>
              <div>
                <p className="font-body text-sm font-medium text-noite-900">{c.t}</p>
                <p className="mt-0.5 font-body text-xs font-light text-tinta-500">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 label-margin text-tinta-500">Parte 2 — Os lugares invisíveis</p>
        <div className="mt-3 divide-y divide-noite-900/10 border-t border-noite-900/10">
          {PARTE2.map((c) => (
            <div key={c.n} className="grid grid-cols-[40px_1fr] gap-3 py-4">
              <span className="font-display text-lg text-ouro-500">{c.n}</span>
              <div>
                <p className="font-body text-sm font-medium text-noite-900">{c.t}</p>
                <p className="mt-0.5 font-body text-xs font-light text-tinta-500">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 label-margin text-tinta-500">Parte 3 — O novo normal</p>
        <div className="mt-3 border-t border-noite-900/10 py-4">
          <div className="grid grid-cols-[40px_1fr] gap-3">
            <span className="font-display text-lg text-ouro-500">13</span>
            <div>
              <p className="font-body text-sm font-medium text-noite-900">Vigiai e Orai</p>
              <p className="mt-0.5 font-body text-xs font-light text-tinta-500">
                A prática da vigilância como tecnologia de reprogramação
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 font-body text-sm font-light leading-relaxed text-tinta-700">
          Mais 4 apêndices práticos: os 12 mantras (um por capítulo), um calendário de 66 dias para marcar sua
          prática, um diário de sobreescrita com perguntas-guia, e um índice de crise para ir direto ao capítulo
          certo quando a vida aperta.
        </p>
      </section>

      {/* QUEM ESCREVE — bio real, específica deste ebook (página "Sobre a autora") */}
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
            <p className="label-margin mb-4 text-horizonte-600">Sobre a autora</p>
            <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Bruna Makdissi</h2>
            <div className="mt-6 space-y-4 font-body text-sm font-light leading-relaxed text-tinta-700">
              <p>
                Mentora financeira energética, Bruna atua nas dinâmicas ocultas que bloqueiam o fluxo de
                prosperidade — integrando neurociência, inteligência emocional e processos energéticos.
              </p>
              <p>
                Seu trabalho parte de uma premissa simples: a escassez não começa no dinheiro. Ela começa na
                desconexão. E a prosperidade real acontece quando você integra emoção, corpo e consciência
                financeira.
              </p>
              <p>
                Bióloga de formação, com experiência em quatro países e quatro idiomas, Bruna une o rigor científico
                à profundidade espiritual num trabalho que transforma não apenas a relação com o dinheiro — mas a
                relação com a própria vida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-card border border-noite-900/10 bg-nevoa-100 p-6 md:p-8">
          <p className="font-display text-3xl text-noite-900">
            R$ {PRECO_SUGERIDO}
            <span className="ml-2 font-body text-sm font-normal text-tinta-500">(sugestão — a confirmar)</span>
          </p>
          <ul className="mt-4 space-y-2 font-body text-sm text-tinta-700">
            <li>✓ {produto.oQueRecebe}</li>
            <li>✓ 12 capítulos + parte prática + 4 apêndices</li>
            <li>✓ Mantras, calendário de 66 dias, diário de sobreescrita e índice de crise</li>
          </ul>
          <div className="mt-6">
            <CtaButton href={whatsappHref} className="w-full">
              Quero meu guia — R$ {PRECO_SUGERIDO}
            </CtaButton>
          </div>
          <div className="mt-4">
            <Pendente>
              Preço ainda não confirmado pela Bruna (catálogo: &ldquo;conteúdo finalizado, falta só definir o
              valor&rdquo;) e ainda sem link de checkout — por isso o botão acima leva pro WhatsApp reservar.
            </Pendente>
          </div>
        </div>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="label-margin mb-4 text-horizonte-600">Perguntas frequentes</p>
        <h2 className="font-display text-2xl text-noite-900 md:text-3xl">Antes de você decidir</h2>

        <div className="mt-8 divide-y divide-noite-900/10 border-t border-noite-900/10">
          <div className="py-5">
            <p className="font-body text-sm font-medium text-noite-900">É só sobre dinheiro?</p>
            <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">
              Não. O guia cobre 12 áreas: dinheiro, tempo, energia, corpo, relações, medo, morte, visibilidade,
              merecimento, prazer, identidade e espiritualidade.
            </p>
          </div>
          <div className="py-5">
            <p className="font-body text-sm font-medium text-noite-900">O guia é um PDF? Recebo na hora?</p>
            <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">
              Sim, é um PDF ({produto.oQueRecebe}). A entrega automática depende do link de checkout, que ainda não
              existe — hoje o contato é feito direto com a Bruna pelo WhatsApp.
            </p>
          </div>
          <div className="py-5">
            <p className="font-body text-sm font-medium text-noite-900">Isso substitui acompanhamento profissional?</p>
            <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">
              Não. Veja o aviso acima, que vale para todos os atendimentos e materiais da Bruna.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL — mantra de encerramento real do ebook */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="font-display text-xl italic leading-snug text-noite-900 md:text-2xl">
          &ldquo;Eu sou abundante por natureza. A escassez foi um aprendizado. A potência é meu lar.&rdquo;
        </p>
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
