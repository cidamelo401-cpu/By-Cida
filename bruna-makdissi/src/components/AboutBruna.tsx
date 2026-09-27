import { brand } from '@/styles/tokens';

/**
 * Conteúdo fiel ao portfólio (página "Quem sou eu"). Sem foto real da Bruna
 * disponível neste projeto ainda — não gerar uma pessoa por IA para
 * representá-la (proibido pela skill de marca, sem exceção).
 */
export function AboutBruna() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="label-margin mb-4 text-horizonte-600">Quem sou eu</p>
      <h2 className="font-display text-2xl text-noite-900 md:text-3xl">
        Eu saí da escassez. <em className="text-horizonte-600">É daí que eu ensino.</em>
      </h2>

      <div className="mt-8 space-y-4 font-body text-sm font-light leading-relaxed text-tinta-700">
        <p>
          Sou <strong className="font-medium text-noite-900">Bruna Makdissi</strong>, bióloga, naturopata holística e
          desprogramadora neurobiológica. Hoje sou mentora financeira e energética.
        </p>
        <p>
          Sou sensitiva e trabalho com a percepção do campo energético de pessoas e lugares. Uno esse olhar à minha
          formação sem misturar uma coisa com a outra: a biologia me deu método, a espiritualidade me deu
          profundidade.
        </p>
        <p>Sou mãe de três, e minha família é a minha maior escola. Tudo o que levo para os atendimentos, antes eu vivi dentro de casa.</p>
      </div>

      <blockquote className="quote-reflective mt-8 border-l-2 border-ouro-500 pl-6 text-noite-900">
        &ldquo;{brand.quote}&rdquo;
      </blockquote>
    </section>
  );
}
