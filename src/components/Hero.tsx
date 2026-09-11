export default function Hero() {
  return (
    <section id="inicio" className="scroll-mt-20 px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-border px-4 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Apresentação
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Bem-vindo(a) à <span className="text-accent">By Cida</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Um espaço dedicado a cuidar de você com atenção, qualidade e carinho em cada detalhe.
          Conheça nossa história, nossos serviços e fale com a gente.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#contato"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Fale conosco
          </a>
          <a
            href="#servicos"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Ver serviços
          </a>
        </div>
      </div>
    </section>
  );
}
