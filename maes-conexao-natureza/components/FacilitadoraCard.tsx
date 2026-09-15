import type { Facilitadora } from '@/types';

export default function FacilitadoraCard({ f }: { f: Facilitadora }) {
  const instagramUrl = f.instagram
    ? 'https://instagram.com/' + f.instagram.replace('@', '')
    : '';

  return (
    <li className="flex flex-col gap-3 rounded-card border border-forest/[.07] bg-white p-4">
      <div className="flex items-center gap-3.5">
        {f.foto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={f.foto}
            alt={f.nome}
            className="h-[60px] w-[60px] flex-none rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-[60px] w-[60px] flex-none items-center justify-center rounded-full font-display text-[22px] font-bold leading-none text-white"
            style={{ background: f.cor }}
          >
            {f.iniciais}
          </span>
        )}
        <span className="flex flex-col gap-1">
          <span className="font-display text-[17px] font-bold leading-tight text-forest">{f.nome}</span>
          <span className="text-xs font-medium leading-[1.35] text-forest/60">{f.papel}</span>
        </span>
      </div>

      {f.bio && (
        <p className="text-[13px] font-medium leading-[1.5] text-forest/65">{f.bio}</p>
      )}

      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[40px] items-center justify-center rounded-[14px] bg-mint text-[13px] font-bold text-olive-deep transition-colors hover:bg-sage/40"
        >
          {f.instagram}
        </a>
      )}
    </li>
  );
}
