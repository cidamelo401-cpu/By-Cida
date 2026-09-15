'use client';

import type { ItemChecklist } from '@/types';

interface Props {
  item: ItemChecklist;
  marcado: boolean;
  onToggle: (id: string) => void;
}

/** Item do checklist: caixa 24px, marcado fica verde e o texto riscado. */
export default function ChecklistRow({ item, marcado, onToggle }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={marcado}
        className="flex min-h-[44px] w-full items-center gap-3.5 border-b border-forest/[.06] py-[15px] text-left"
      >
        <span
          className="flex h-6 w-6 flex-none items-center justify-center rounded-lg border-2 text-xs font-bold leading-none text-white"
          style={{
            borderColor: marcado ? '#5C7A2E' : 'rgba(30,49,35,.22)',
            background: marcado ? '#5C7A2E' : 'transparent'
          }}
        >
          {marcado ? '✓' : ''}
        </span>
        <span
          className="text-sm font-medium leading-[1.35]"
          style={{
            color: marcado ? 'rgba(30,49,35,.4)' : '#1E3123',
            textDecoration: marcado ? 'line-through' : 'none'
          }}
        >
          {item.texto}
        </span>
      </button>
    </li>
  );
}
