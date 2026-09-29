import type { Metadata } from 'next';
import { products } from '@/data/services';
import type { Product, ProductCategory } from '@/data/types';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Serviços — Bruna Makdissi',
  robots: { index: false, follow: false },
};

/**
 * ESQUELETO — só pra validar organização com a Cida antes de escrever copy
 * definitiva. Reaproveita os dados crus de services.ts (paraQueServe,
 * comoFunciona, preço), sem editorial própria por produto ainda (isso vem
 * depois, no mesmo espírito da resultContent.ts do resultado).
 */

const CATEGORIA_LABEL: Record<ProductCategory, string> = {
  digital: 'Digital',
  jornada: 'Jornadas',
  evento_coletivo: 'Atendimento coletivo',
  mesa: 'Mesas radiônicas',
  diagnostico: 'Diagnósticos',
  mentoria: 'Mentorias',
  intensivo: 'Processo intensivo',
  sustentacao: 'Sustentação',
};

// Ordem sugerida: do ticket mais leve pro mais alto (esteira comercial).
const ORDEM: ProductCategory[] = ['digital', 'jornada', 'evento_coletivo', 'mesa', 'diagnostico', 'mentoria', 'intensivo', 'sustentacao'];

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
  const grupos = ORDEM.map((categoria) => ({
    categoria,
    produtos: products.filter((p) => p.categoria === categoria),
  })).filter((g) => g.produtos.length > 0);

  return (
    <main className="min-h-screen bg-nevoa-200">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Logo variant="claro" className="mb-10 h-7 w-auto" />
        <p className="label-margin text-horizonte-600">Esqueleto — não é a página final</p>
        <h1 className="mt-3 font-display text-2xl text-noite-900 md:text-3xl">Todos os atendimentos</h1>
        <p className="mt-3 font-body text-sm font-light leading-relaxed text-tinta-700">
          Cada bloco abaixo é uma categoria do catálogo. Título e descrição ainda são o texto cru da planilha — a
          copy definitiva vem depois de aprovar esta organização.
        </p>

        {grupos.map(({ categoria, produtos }) => (
          <section key={categoria} className="mt-12 border-t border-noite-900/10 pt-8">
            <p className="label-margin mb-4 text-horizonte-600">{CATEGORIA_LABEL[categoria]}</p>
            <div className="space-y-6">
              {produtos.map((produto) => (
                <div key={produto.id}>
                  <h2 className="font-display text-lg text-noite-900">{produto.nome}</h2>
                  <p className="mt-1 font-body text-sm font-light leading-relaxed text-tinta-700">{produto.paraQueServe}</p>
                  <p className="mt-2 font-body text-xs text-tinta-500">{produto.duracaoRitmo}</p>
                  <p className="mt-1 font-body text-sm font-medium text-noite-900">{precoLabel(produto)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
