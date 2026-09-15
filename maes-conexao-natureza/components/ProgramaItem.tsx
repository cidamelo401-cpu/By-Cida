import type { ItemPrograma } from '@/types';

/** Linha da programação: hora à esquerda, card com faixa colorida à direita. */
export default function ProgramaItem({ item }: { item: ItemPrograma }) {
  return (
    <li className="flex gap-3">
      <div className="w-[46px] flex-none pt-4 text-[13px] font-bold leading-none text-forest/55">
        {item.hora}
      </div>
      <div
        className="flex flex-1 flex-col gap-[5px] rounded-tile border border-forest/[.07] bg-white px-4 py-3.5"
        style={{ borderLeft: '4px solid ' + item.cor }}
      >
        <h2 className="font-display text-[15px] font-bold leading-tight text-forest">{item.titulo}</h2>
        <p className="text-xs font-medium leading-[1.45] text-forest/60">{item.descricao}</p>
        <span className="pt-[3px] text-[10px] font-semibold uppercase leading-none tracking-[.12em] text-moss">
          {item.responsavel}
        </span>
      </div>
    </li>
  );
}
