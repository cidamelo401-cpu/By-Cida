const TESTIMONIALS = [
  {
    quote:
      "Atendimento excepcional! Me senti acolhida do início ao fim e o resultado superou minhas expectativas.",
    name: "Mariana Souza",
    role: "Cliente",
  },
  {
    quote:
      "Profissionalismo e cuidado em cada detalhe. Recomendo de olhos fechados para quem busca qualidade.",
    name: "Fernanda Lima",
    role: "Cliente",
  },
  {
    quote:
      "Um dos melhores atendimentos que já tive. Voltarei sempre — e já indiquei para toda a família.",
    name: "Juliana Alves",
    role: "Cliente",
  },
];

export default function Testimonials() {
  return (
    <section
      id="depoimentos"
      className="scroll-mt-20 border-t border-border bg-muted px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-accent">
            Depoimentos
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Quem confia, recomenda
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <blockquote className="text-sm text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto">
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
