import type { Metadata } from 'next';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { CtaButton } from '@/components/ui/CtaButton';
import { buildWhatsappLink } from '@/data/whatsappTemplates';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Agenda de Outubro — Bruna Makdissi',
  description: 'O que a Bruna abre para caminhar com você este mês.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Agenda de Outubro — Bruna Makdissi',
    description: 'O que eu abro para caminhar com você este mês.',
  },
};

/**
 * Página "Agenda do mês" — recriação da peça gráfica que a Cida já tinha
 * (ver anexo), com o CTA de inscrição virando link de verdade pro WhatsApp.
 *
 * Decisão da Cida: sem chave Pix/nome na página (só no WhatsApp, quando a
 * pessoa já decidiu pagar por Pix) — reduz exposição de dado financeiro
 * numa URL pública, mesmo sem indexar.
 *
 * Conteúdo (preços, datas, condições) vem literalmente do texto que a Cida
 * mandou pro grupo — nada inventado. Esta página é por natureza mensal:
 * os arrays SESSOES/COMBOS abaixo precisam ser trocados todo mês.
 */

const MES = 'Outubro';

const SESSOES = [
  {
    data: 'Out.',
    periodo: 'Todo o mês',
    titulo: 'Leitura de órgãos + tarô',
    subtitulo: 'Sessão individual',
    precoOriginal: 530,
    precoPromo: 350,
    nota: null,
  },
  {
    data: '10/10',
    periodo: 'Portal',
    titulo: 'Portal da Lakshmi',
    subtitulo: 'Portal das 4 Prosperidades',
    precoOriginal: 44,
    precoPromo: 35,
    nota: 'grupo · até 30/09',
  },
  {
    data: '12/10',
    periodo: '7 dias',
    titulo: 'Jornada Acolhendo a criança ferida',
    subtitulo: 'Nas primeiras 24h, cada inscrição leva mais 3 pessoas',
    precoOriginal: null,
    precoPromo: 97,
    nota: 'R$ 35 nas 1ªs 24h',
  },
  {
    data: 'Fim',
    periodo: 'do mês',
    titulo: 'Jornada Cura do ventre',
    subtitulo: 'Com Paty · constelação familiar e dinheiro',
    precoOriginal: null,
    precoPromo: 97,
    nota: 'R$ 53 nas 1ªs 24h',
  },
] as const;

const COMBOS = [
  {
    numeral: '01',
    titulo: 'Prosperidade',
    subtitulo: 'Leitura de órgãos + tarô e Portal da Lakshmi',
    precoOriginal: 385,
    precoPromo: 370,
  },
  {
    numeral: '02',
    titulo: 'Duas jornadas',
    subtitulo: 'Criança ferida e Cura do ventre',
    precoOriginal: 194,
    precoPromo: 147,
  },
  {
    numeral: '03',
    titulo: 'Outubro completo',
    subtitulo: 'Leitura + Portal + as duas jornadas',
    precoOriginal: 579,
    precoPromo: 447,
  },
] as const;

const whatsappHref = buildWhatsappLink(`Oi, Bruna! Vi a Agenda de ${MES} e quero me inscrever.`);

function linkParaItem(nome: string) {
  return buildWhatsappLink(`Oi, Bruna! Vi a Agenda de ${MES} e quero me inscrever em: ${nome}.`);
}

export default function AgendaPage() {
  return (
    <main className="min-h-screen bg-nevoa-200">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-2/3">
          <Image
            src="/bruna/bruna-sozinha-look-bege-01.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover object-top opacity-80"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, #F9F2F1 0%, rgba(249,242,241,.55) 38%, rgba(249,242,241,0) 70%)' }}
          />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 pt-10 pb-16 md:pt-14">
          <p className="label-margin text-noite-900">Bruna Makdissi</p>
          <p className="label-margin text-tinta-500">Mentora financeira energética</p>

          <h1 className="mt-6 font-display text-6xl leading-none text-noite-900 md:text-7xl">
            Agenda
            <br />
            <em className="text-horizonte-600">{MES}</em>
          </h1>

          <p className="mt-6 max-w-xs font-display text-base italic leading-snug text-tinta-700">
            O que eu abro para caminhar com você este mês.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 pb-16">
        <p className="label-margin mb-4 text-tinta-500">Sessões e jornadas</p>
        <div className="divide-y divide-noite-900/10 border-t border-noite-900/10">
          {SESSOES.map((s) => (
            <div key={s.titulo} className="grid grid-cols-[64px_1fr] gap-4 py-5">
              <div>
                <p className="font-display text-lg italic leading-tight text-ouro-600">{s.data}</p>
                <p className="label-margin text-tinta-500">{s.periodo}</p>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg leading-snug text-noite-900">{s.titulo}</p>
                  <p className="mt-1 font-body text-sm font-light text-tinta-700">{s.subtitulo}</p>
                  <a
                    href={linkParaItem(s.titulo)}
                    className="mt-2 inline-block font-body text-xs font-medium text-horizonte-600 hover:text-horizonte-700"
                  >
                    Quero essa →
                  </a>
                </div>
                <div className="shrink-0 text-right">
                  {s.precoOriginal && (
                    <p className="font-body text-xs text-tinta-400 line-through">R$ {s.precoOriginal}</p>
                  )}
                  <p className="font-body text-sm text-noite-900">
                    R$ <span className="text-lg font-medium">{s.precoPromo}</span>
                  </p>
                  {s.nota && <p className="mt-1 font-body text-xs text-horizonte-600">{s.nota}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-card bg-noite-900 p-6 md:p-8">
          <p className="label-margin mb-4 text-ouro-300">Combos de {MES.toLowerCase()}</p>
          <div className="divide-y divide-nevoa-0/10">
            {COMBOS.map((c) => (
              <div key={c.numeral} className="flex items-start justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="font-display text-base text-ouro-500">{c.numeral}</span>
                  <div>
                    <p className="font-display text-lg text-nevoa-0">{c.titulo}</p>
                    <p className="mt-1 font-body text-sm font-light text-noite-200">{c.subtitulo}</p>
                    <a
                      href={linkParaItem(c.titulo)}
                      className="mt-2 inline-block font-body text-xs font-medium text-horizonte-300 hover:text-horizonte-200"
                    >
                      Quero esse combo →
                    </a>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-body text-xs text-noite-300 line-through">R$ {c.precoOriginal}</p>
                  <p className="font-body text-sm text-nevoa-0">
                    R$ <span className="text-lg font-medium">{c.precoPromo}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-noite-900/10 pt-8 md:flex-row md:items-end">
          <div>
            <p className="font-display text-base italic leading-snug text-noite-900">
              Para se inscrever, me chama no WhatsApp
            </p>
            <p className="mt-2 font-body text-sm text-tinta-700">{site.whatsappDisplay}</p>
            <a href={site.instagramUrl} className="font-body text-sm text-tinta-500 hover:text-horizonte-600">
              {site.instagram}
            </a>
            <div className="mt-4">
              <CtaButton href={whatsappHref}>Me chama no WhatsApp</CtaButton>
            </div>
          </div>
          <Logo variant="claro" className="h-16 w-auto" />
        </div>
      </div>
    </main>
  );
}
