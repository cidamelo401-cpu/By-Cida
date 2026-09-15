import Link from 'next/link';

interface Props {
  src: string;
  alt: string;
  /** object-position vertical, ex.: '30%'. Cada foto tem um recorte próprio. */
  posicao: string;
  altura: number;
  gradiente: string;
  voltarPara?: string;
  children: React.ReactNode;
}

/**
 * Hero fotográfico com scrim. IMPORTANTE: só cachoeira.jpeg pode ser usada aqui —
 * as outras fotos têm legenda de Instagram gravada na imagem.
 */
export default function HeroImage({ src, alt, posicao, altura, gradiente, voltarPara, children }: Props) {
  return (
    <div className="relative overflow-hidden" style={{ height: altura }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: '50% ' + posicao }}
      />
      <div className="absolute inset-0" style={{ background: gradiente }} />
      {voltarPara ? (
        <Link
          href={voltarPara}
          aria-label="Voltar"
          className="absolute left-[18px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 text-lg font-semibold leading-none text-forest"
          style={{ top: 'var(--safe-top)' }}
        >
          ‹
        </Link>
      ) : null}
      {children}
    </div>
  );
}
