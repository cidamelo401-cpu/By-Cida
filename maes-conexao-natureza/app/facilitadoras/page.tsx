import ScreenHeader from '@/components/ScreenHeader';
import FacilitadoraCard from '@/components/FacilitadoraCard';
import { FACILITADORAS } from '@/services/eventData';
import { ROUTES } from '@/lib/navigation';

export default function FacilitadorasPage() {
  return (
    <div>
      <ScreenHeader titulo="Facilitadoras" voltarPara={ROUTES.home} />
      <ul className="flex flex-col gap-3 px-[18px] pb-[22px] pt-3">
        {FACILITADORAS.map((f) => (
          <FacilitadoraCard key={f.id} f={f} />
        ))}
      </ul>
    </div>
  );
}
