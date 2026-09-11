const SERVICES = [
  {
    title: "Atendimento personalizado",
    description: "Cada cliente é único. Preparamos um atendimento sob medida para as suas necessidades.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
      />
    ),
  },
  {
    title: "Qualidade garantida",
    description: "Utilizamos os melhores materiais e técnicas para garantir resultados duradouros.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75l1.5 1.5L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Horários flexíveis",
    description: "Agendamento simples, com horários que se encaixam na sua rotina.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Suporte próximo",
    description: "Estamos sempre disponíveis para tirar dúvidas antes, durante e depois do serviço.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
];

export default function Services() {
  return (
    <section id="servicos" className="scroll-mt-20 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-accent">
            Serviços
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            O que oferecemos
          </h2>
          <p className="mt-4 text-muted-foreground">
            Soluções pensadas para atender você com excelência do início ao fim.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-4 rounded-2xl border border-border p-6 transition-colors hover:bg-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  {service.icon}
                </svg>
              </div>
              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
