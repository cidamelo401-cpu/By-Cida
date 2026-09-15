'use client';

import Link from 'next/link';
import { useState } from 'react';
import HeroImage from '@/components/HeroImage';
import { FOTO_LIMPA, LOCAL_INFO } from '@/services/eventData';
import { ROUTES } from '@/lib/navigation';

export default function LocalPage() {
  const [copiado, setCopiado] = useState(false);

  function abrirMapa() {
    const q = encodeURIComponent('Sítio Anju, Grande São Paulo');
    window.open('https://maps.google.com/maps?q=' + q, '_blank');
  }

  function copiarEndereco() {
    navigator.clipboard.writeText(LOCAL_INFO.endereco.replace('\n', ', ')).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }).catch(() => {});
  }

  return (
    <div>
      <HeroImage
        src={FOTO_LIMPA.src}
        alt="Gramado, casa e cachoeira do Sítio Anju"
        posicao="22%"
        altura={250}
        gradiente="linear-gradient(0deg,rgba(20,38,22,.85),rgba(20,38,22,.1))"
        voltarPara={ROUTES.home}
      >
        <h1 className="absolute bottom-[18px] left-5 font-display text-3xl font-bold leading-none text-white">
          Sítio Anju
        </h1>
      </HeroImage>

      <div className="flex flex-col gap-3 p-[18px]">
        <section className="flex flex-col gap-3 rounded-card border border-forest/[.07] bg-white p-[18px]">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-[.16em] text-moss">
              Endereço
            </span>
            <p className="whitespace-pre-line text-sm font-semibold leading-[1.45] text-forest">
              {LOCAL_INFO.endereco}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={abrirMapa}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-[14px] bg-mint p-3 text-center text-xs font-bold leading-none text-olive-deep transition-colors hover:bg-sage/40"
            >
              Abrir no mapa
            </button>
            <button
              type="button"
              onClick={copiarEndereco}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-[14px] bg-mint p-3 text-center text-xs font-bold leading-none text-olive-deep transition-colors hover:bg-sage/40"
            >
              {copiado ? 'Copiado!' : 'Copiar endereço'}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-2.5 rounded-card bg-forest p-[18px]">
          <h2 className="font-display text-[15px] font-bold leading-none text-cream">Como chegar</h2>
          <p className="text-xs font-medium leading-[1.55] text-cream/75">{LOCAL_INFO.comoChegar}</p>
          <Link
            href={ROUTES.mural}
            className="flex min-h-[44px] items-center justify-center rounded-[14px] bg-cream/[.12] p-3 text-center text-xs font-bold leading-none text-amber"
          >
            Procurar carona no mural
          </Link>
        </section>

        <section className="flex flex-col gap-2.5 rounded-card border border-forest/[.07] bg-white p-[18px]">
          <h2 className="font-display text-[15px] font-bold leading-none text-forest">Bom saber</h2>
          <p className="text-xs font-medium leading-[1.55] text-forest/65">{LOCAL_INFO.bomSaber}</p>
        </section>
      </div>
    </div>
  );
}
