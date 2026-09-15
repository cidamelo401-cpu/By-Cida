import ScreenHeader from '@/components/ScreenHeader';
import ProgramaItem from '@/components/ProgramaItem';
import { PROGRAMA } from '@/services/eventData';

export default function ProgramaPage() {
  return (
    <div>
      <ScreenHeader kicker="Sábado, 17 de outubro" titulo="O dia inteiro" />
      <ul className="flex flex-col gap-2.5 px-[18px] pb-[22px] pt-3">
        {PROGRAMA.map((item) => (
          <ProgramaItem key={item.hora} item={item} />
        ))}
      </ul>
    </div>
  );
}
