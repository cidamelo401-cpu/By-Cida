const HIGHLIGHTS = [
  { value: "10+", label: "Anos de experiência" },
  { value: "500+", label: "Clientes atendidos" },
  { value: "4.9", label: "Avaliação média" },
];

export default function About() {
  return (
    <section id="sobre" className="scroll-mt-20 border-t border-border bg-muted px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-wide text-accent">
            Sobre nós
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Nossa história
          </h2>
          <p className="text-muted-foreground">
            A By Cida nasceu do desejo de oferecer um atendimento próximo e de qualidade,
            unindo experiência, cuidado e atenção aos detalhes em cada serviço prestado.
          </p>
          <p className="text-muted-foreground">
            Ao longo dos anos, construímos relações de confiança com nossos clientes,
            sempre buscando entregar o melhor resultado com dedicação e profissionalismo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background px-4 py-6 text-center"
            >
              <span className="text-3xl font-semibold text-accent">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
