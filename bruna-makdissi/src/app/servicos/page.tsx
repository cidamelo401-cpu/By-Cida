import type { Metadata } from 'next';
import { products } from '@/data/services';
import type { Product, TemaId } from '@/data/types';
import { temaQuestion } from '@/data/questions';
import { Logo } from '@/components/Logo';
import { CtaButton } from '@/components/ui/CtaButton';

export const metadata: Metadata = {
  title: 'Serviços — Bruna Makdissi',
  openGraph: {
    title: 'Todos os atendimentos — Bruna Makdissi',
    description: 'Organizado por tema: dinheiro, corpo, relações, casa ou empresa, pet, ansiedade, espiritual e luto.',
  },
  robots: { index: false, follow: false },
};

/**
 * ESQUELETO — só pra validar organização com a Cida antes de escrever copy
 * definitiva. Reaproveita os dados crus de services.ts (paraQueServe,
 * comoFunciona, preço), sem editorial própria por produto ainda (isso vem
 * depois, no mesmo espírito da resultContent.ts do resultado).
 *
 * Decisões da Cida (validadas nesta rodada):
 * - Formato accordion (usa <details>/<summary> nativo — zero JS, acessível,
 *   funciona sem componente client) em vez de lista aberta.
 * - Agrupamento por TEMA (mesmo TemaId do quiz), não por categoria comercial.
 * - Relação com o quiz: complementar. O quiz continua sendo o caminho
 *   principal e personalizado; esta página é o catálogo completo pra quem já
 *   sabe o que quer ou prefere navegar sozinho.
 */

// Mapa dos tags crus de services.ts (temaPrincipal) pro TemaId canônico do
// quiz. Alguns tags não têm mapa 1:1 (ex.: "Trabalho") — nesses casos o
// produto ainda aparece pelo(s) outro(s) tema(s) que ele também carrega.
const TAG_TO_TEMA: Record<string, TemaId> = {
  dinheiro: 'dinheiro',
  negócio: 'dinheiro',
  negocio: 'dinheiro',
  'saúde/corpo': 'corpo',
  'saude/corpo': 'corpo',
  corpo: 'corpo',
  saúde: 'corpo',
  saude: 'corpo',
  relacionamentos: 'relacoes',
  relações: 'relacoes',
  relacoes: 'relacoes',
  espiritual: 'espiritual',
  ancestral: 'espiritual',
  emocional: 'ansiedade',
  ambiente: 'casa_empresa',
  casa: 'casa_empresa',
  empresa: 'casa_empresa',
  pet: 'pet',
};

// T09 (Mesa do Luto) não carrega a tag "Luto" em services.ts — é a mesma
// inconsistência do catálogo já sinalizada no README pra Bruna validar.
// Aqui a página força o produto certo pro tema certo, do jeito que o motor
// do quiz (recommendationRules.ts) já faz.
const OVERRIDE_TEMAS: Record<string, TemaId[]> = {
  T09: ['luto'],
};

function resolveTemas(produto: Product): TemaId[] {
  if (OVERRIDE_TEMAS[produto.id]) return OVERRIDE_TEMAS[produto.id];
  const temas = new Set<TemaId>();
  for (const tag of produto.temaPrincipal) {
    const tema = TAG_TO_TEMA[tag.toLowerCase()];
    if (tema) temas.add(tema);
  }
  return [...temas];
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function precoLabel(produto: Product): string {
  const { preco } = produto;
  if (preco.mode === 'sob_consulta') return 'Sob consulta';
  if (preco.mode === 'a_definir') return 'Em definição';
  if (preco.valor === undefined) return '';
  if (preco.pacote) return `${brl.format(preco.valor)} · pacote ${preco.pacote.sessoes}x por ${brl.format(preco.pacote.valor)}`;
  if (preco.temVersaoGravada && preco.valorGravado !== undefined) return `${brl.format(preco.valor)} ao vivo · ${brl.format(preco.valorGravado)} gravado`;
  return brl.format(preco.valor);
}

export default function ServicosPage() {
  const grupos = temaQuestion.opcoes
    .map((opcao) => ({
      tema: opcao.id,
      label: opcao.label,
      emoji: opcao.emoji,
      produtos: products.filter((p) => resolveTemas(p).includes(opcao.id)),
    }))
    .filter((g) => g.produtos.length > 0);

  const semTema = products.filter((p) => resolveTemas(p).length === 0);

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Logo variant="claro" className="mb-10 h-7 w-auto" />
        <p className="label-margin text-horizonte-600">Esqueleto — não é a página final</p>
        <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">Todos os atendimentos</h1>
        <p className="mt-3 font-body text-sm font-light leading-relaxed text-tinta-700">
          Organizado por tema, igual ao direcionamento. Título e descrição ainda são o texto cru da planilha — a copy
          definitiva vem depois de aprovar esta organização.
        </p>

        <div className="mt-6 rounded-card border border-noite-900/10 bg-nevoa-100 p-5">
          <p className="font-body text-sm font-light leading-relaxed text-tinta-700">
            Não sabe por onde começar? O direcionamento faz 4 perguntas rápidas e já te mostra o caminho certo.
          </p>
          <div className="mt-3">
            <CtaButton href="/quiz" variant="secondary">
              Fazer o direcionamento
            </CtaButton>
          </div>
        </div>

        <div className="mt-10 divide-y divide-noite-900/10 border-t border-noite-900/10">
          {grupos.map(({ tema, label, emoji, produtos }) => (
            <details key={tema} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                <span className="font-display text-lg text-noite-900">
                  {emoji} {label}
                </span>
                <span className="flex items-center gap-3">
                  <span className="label-margin text-tinta-500">
                    {produtos.length} {produtos.length === 1 ? 'atendimento' : 'atendimentos'}
                  </span>
                  <span className="font-display text-xl text-ouro-500 transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <div className="space-y-6 pb-8">
                {produtos.map((produto) => (
                  <div key={produto.id} className="border-t border-noite-900/5 pt-5">
                    <h2 className="font-display text-base text-noite-900">{produto.nome}</h2>
                    <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">
                      {produto.paraQueServe}
                    </p>
                    <p className="mt-2 font-body text-xs text-tinta-500">{produto.duracaoRitmo}</p>
                    <p className="mt-1 font-body text-sm font-medium text-noite-900">{precoLabel(produto)}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        {semTema.length > 0 && (
          <details className="mt-2 border-t border-noite-900/10 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4">
              <span className="font-display text-lg text-noite-900">Outros</span>
              <span className="label-margin text-tinta-500">
                {semTema.length} {semTema.length === 1 ? 'atendimento' : 'atendimentos'}
              </span>
            </summary>
            <div className="space-y-6 pb-8">
              {semTema.map((produto) => (
                <div key={produto.id} className="border-t border-noite-900/5 pt-5">
                  <h2 className="font-display text-base text-noite-900">{produto.nome}</h2>
                  <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">
                    {produto.paraQueServe}
                  </p>
                  <p className="mt-2 font-body text-xs text-tinta-500">{produto.duracaoRitmo}</p>
                  <p className="mt-1 font-body text-sm font-medium text-noite-900">{precoLabel(produto)}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}
