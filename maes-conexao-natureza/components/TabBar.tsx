'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES, TABS } from '@/lib/navigation';

/** Abas: ativo = terracotta; inativo = verde translúcido. Alvo mínimo de 44px. */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-none border-t border-forest/10 bg-cream/95 px-1.5 pt-2.5 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {TABS.map((tab) => {
        const href = ROUTES[tab.id];
        const active = pathname === href;
        const color = active ? '#D5533B' : 'rgba(30,49,35,.35)';
        return (
          <Link
            key={tab.id}
            href={href}
            className="flex min-h-[44px] flex-1 flex-col items-center gap-1.5 py-1.5"
          >
            <span className="h-5 w-5 rounded-[7px]" style={{ background: color }} />
            <span className="text-[10px] font-semibold leading-none" style={{ color }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
