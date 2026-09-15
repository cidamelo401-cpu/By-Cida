interface Props {
  href: string;
  children: React.ReactNode;
  /** externo abre em nova aba (checkout Asaas). */
  externo?: boolean;
  className?: string;
}

/** Botão principal terracotta. Hover escurece para #C24730. */
export default function PrimaryButton({ href, children, externo = false, className = '' }: Props) {
  return (
    <a
      href={href}
      target={externo ? '_blank' : undefined}
      rel={externo ? 'noreferrer' : undefined}
      className={
        'flex min-h-[44px] items-center justify-center rounded-[18px] bg-terracotta px-4 py-[17px] text-center text-base font-bold leading-none text-white transition-colors hover:bg-terracotta-dark ' +
        className
      }
    >
      {children}
    </a>
  );
}
