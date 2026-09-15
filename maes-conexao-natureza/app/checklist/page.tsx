'use client';

import ScreenHeader from '@/components/ScreenHeader';
import ChecklistRow from '@/components/ChecklistRow';
import { CHECKLIST, CHECKLIST_NOTA } from '@/services/eventData';
import { useChecklist } from '@/lib/useChecklist';
import { ROUTES } from '@/lib/navigation';

export default function ChecklistPage() {
  const { marcados, toggle, feitos, total } = useChecklist();

  return (
    <div>
      <ScreenHeader titulo="Minha mochila" voltarPara={ROUTES.home} />
      <div className="flex flex-col gap-3.5 px-[18px] pb-[22px] pt-2.5">
        <p className="text-[13px] font-semibold leading-none text-moss">
          {feitos} de {total} itens separados
        </p>
        <ul className="rounded-card border border-forest/[.07] bg-white px-[18px] py-1">
          {CHECKLIST.map((item) => (
            <ChecklistRow key={item.id} item={item} marcado={!!marcados[item.id]} onToggle={toggle} />
          ))}
        </ul>
        <p className="rounded-card bg-blush px-[18px] py-4 text-xs font-medium leading-[1.55] text-clay">
          {CHECKLIST_NOTA}
        </p>
      </div>
    </div>
  );
}
