type PublicDisclaimerProps = {
  texto: string;
  /** Destaque maior (fundo/borda em tom de atenção) para casos como ansiedade. */
  destaque?: boolean;
};

export function PublicDisclaimer({ texto, destaque = false }: PublicDisclaimerProps) {
  if (!destaque) {
    return <p className="mt-6 font-body text-xs font-light leading-relaxed text-tinta-500">{texto}</p>;
  }

  return (
    <div className="mt-6 rounded-field border border-horizonte-300 bg-horizonte-100 px-4 py-3">
      <p className="font-body text-xs font-light leading-relaxed text-horizonte-700">{texto}</p>
    </div>
  );
}
