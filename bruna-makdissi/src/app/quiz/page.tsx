import Link from 'next/link';

/**
 * Placeholder — o quiz de verdade é a Fase 3. Existe só para o link do Hero
 * e do CTA não quebrar enquanto essa fase não é construída.
 */
export default function QuizPlaceholder() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="label-margin text-horizonte-600">Em construção</p>
      <h1 className="font-display text-2xl text-noite-900">O quiz está a caminho.</h1>
      <p className="font-body text-sm font-light text-tinta-700">
        Essa parte da experiência ainda está sendo construída.
      </p>
      <Link href="/" className="font-body text-sm text-horizonte-600 hover:text-horizonte-700">
        Voltar para o início
      </Link>
    </main>
  );
}
