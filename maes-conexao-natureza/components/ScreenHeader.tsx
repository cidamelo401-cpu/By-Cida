import Link from 'next/link';

interface Props {
  titulo: string;
  /** Rota do botão voltar. Sem back quando a tela é de aba. */
  voltarPara?: string;
  kicker?: string;
}

/** Cabeçalho das telas internas. O padding-top reserva a área da status bar. */
export default function ScreenHeader({ titulo, voltarPara, kicker }: Props) {
  return (
    <header
      className="flex items-center gap-3 px-[18px] pb-1.5"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      {voltarPara ? (
        <Link
          href={voltarPara}
          aria-label="Voltar"
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-forest/10 bg-white text-lg font-semibold leading-none text-forest"
        >
          ‹
        </Link>
      ) : null}
      <div className="flex flex-col gap-[3px]">
        {kicker ? (
          <span className="text-[10px] font-semibold uppercase leading-none tracking-[.18em] text-moss">
            {kicker}
          </span>
        ) : null}
        <h1 className="font-display text-[19px] font-bold leading-none text-forest">{titulo}</h1>
      </div>
    </header>
  );
}
