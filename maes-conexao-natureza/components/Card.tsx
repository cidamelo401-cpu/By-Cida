interface Props {
  children: React.ReactNode;
  className?: string;
}

/** Card branco padrão: raio 22px, borda verde a 7-8% e fundo branco. */
export default function Card({ children, className = '' }: Props) {
  return (
    <div className={'rounded-card border border-forest/[.07] bg-white ' + className}>{children}</div>
  );
}
