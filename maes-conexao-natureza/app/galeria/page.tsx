import ScreenHeader from '@/components/ScreenHeader';
import { FOTO_LIMPA, GALERIA } from '@/services/eventData';
import { ROUTES } from '@/lib/navigation';

export default function GaleriaPage() {
  return (
    <div>
      <ScreenHeader titulo="Edições anteriores" voltarPara={ROUTES.home} />
      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-3">
        <p className="text-xs font-medium leading-[1.5] text-forest/55">
          Posts das duas primeiras edições, como foram publicados.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {GALERIA.map((foto) => (
            <div key={foto.src} className="overflow-hidden rounded-tile bg-forest" style={{ aspectRatio: '4 / 5' }}>
              {/* Fotos com legenda gravada aparecem inteiras: object-contain evita cortar o texto. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.src} alt={foto.alt} className="block h-full w-full object-contain" />
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[20px]" style={{ aspectRatio: '3 / 4' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FOTO_LIMPA.src}
            alt="Piquenique em roda diante da cachoeira"
            className="block h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
