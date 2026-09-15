'use client';

import ScreenHeader from '@/components/ScreenHeader';
import { INCLUI } from '@/services/eventData';
import { ROUTES } from '@/lib/navigation';
import { useParticipante } from '@/lib/useParticipante';

export default function InscricaoPage() {
  const { participante } = useParticipante();

  return (
    <div>
      <ScreenHeader titulo="Minha vaga" voltarPara={ROUTES.home} />

      <div className="flex flex-col gap-4 px-[18px] pb-5 pt-2">
        {/* Dados da participante */}
        <section className="flex flex-col gap-3.5 rounded-card bg-forest p-[18px]">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-[.18em] text-sage">
              Participante confirmada
            </span>
            <span className="font-display text-2xl font-bold leading-tight text-cream">
              {participante?.nome ?? '—'}
            </span>
          </div>
          {participante?.whatsapp && (
            <div className="flex flex-col gap-[3px]">
              <span className="text-[10px] font-semibold uppercase leading-none tracking-[.18em] text-sage">
                WhatsApp
              </span>
              <span className="text-sm font-semibold text-cream/80">
                {participante.whatsapp}
              </span>
            </div>
          )}
          <span className="self-start rounded-chip bg-moss-light/20 px-3 py-1.5 text-xs font-bold text-moss-light">
            Vaga confirmada ✓
          </span>
        </section>

        {/* O que está incluso */}
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-[15px] font-bold text-forest">O que está incluso</h2>
          <ul className="rounded-card border border-forest/[.08] bg-white px-[18px] py-1.5">
            {INCLUI.map((item) => (
              <li key={item} className="flex items-center gap-3 border-b border-forest/[.06] py-[13px] last:border-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-[11px] font-bold leading-none text-moss-dark">
                  ✓
                </span>
                <span className="text-[13px] font-medium leading-[1.3] text-forest">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="rounded-card bg-mint px-[18px] py-4 text-xs font-medium leading-[1.55] text-olive-deep">
          Dúvidas sobre sua inscrição? Fale com a organizadora pelo grupo do WhatsApp.
        </p>
      </div>
    </div>
  );
}
