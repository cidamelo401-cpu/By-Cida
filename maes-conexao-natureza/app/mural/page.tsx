import ScreenHeader from '@/components/ScreenHeader';
import MuralPost from '@/components/MuralPost';
import { AVISO_MURAL, EVENTO, MURAL } from '@/services/eventData';

export default function MuralPage() {
  return (
    <div>
      <ScreenHeader
        kicker={EVENTO.vagasTotais + ' mães · ' + EVENTO.edicao + 'ª edição'}
        titulo="Mural da roda"
      />
      <div className="flex flex-col gap-3 px-[18px] pb-6 pt-3">
        {/* Composer: ainda não escreve nada. Ver CLAUDE.md > Não implementado. */}
        <div className="flex items-center gap-3 rounded-[20px] border border-forest/[.08] bg-white px-4 py-[15px]">
          <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-mint font-display text-[13px] font-bold leading-none text-moss-dark">
            V
          </span>
          <span className="flex-1 text-[13px] font-medium leading-none text-forest/[.42]">
            Escrever para o grupo…
          </span>
        </div>

        <section className="flex flex-col gap-[5px] rounded-[20px] bg-amber px-[18px] py-4">
          <h2 className="text-[10px] font-semibold uppercase leading-none tracking-[.16em] text-amber-label">
            {AVISO_MURAL.titulo}
          </h2>
          <p className="text-[13px] font-semibold leading-[1.5] text-amber-ink">{AVISO_MURAL.texto}</p>
        </section>

        <ul className="flex flex-col gap-3">
          {MURAL.map((post) => (
            <MuralPost key={post.id} post={post} />
          ))}
        </ul>
      </div>
    </div>
  );
}
