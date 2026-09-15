'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TabBar from './TabBar';
import RegisterServiceWorker from './RegisterServiceWorker';
import { useParticipante } from '@/lib/useParticipante';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { participante, carregando } = useParticipante();

  const noCadastro = pathname === '/cadastro';

  useEffect(() => {
    if (carregando) return;
    if (!participante && !noCadastro) {
      router.replace('/cadastro');
    }
  }, [participante, carregando, noCadastro, router]);

  // Enquanto carrega, mostra nada (evita flash)
  if (carregando) {
    return (
      <div className="app-viewport">
        <div className="app-frame">
          <main className="flex flex-1 items-center justify-center">
            <span className="font-display text-lg font-bold text-forest/30">…</span>
          </main>
        </div>
      </div>
    );
  }

  // Cadastro: sem tab bar, sem moldura de app
  if (noCadastro) {
    return (
      <div className="app-viewport">
        <div className="app-frame">
          {children}
          <RegisterServiceWorker />
        </div>
      </div>
    );
  }

  // Se não está cadastrada e não está no cadastro, não renderiza (redirect em andamento)
  if (!participante) return null;

  return (
    <div className="app-viewport">
      <div className="app-frame">
        <main className="flex-1 overflow-y-auto pb-2">{children}</main>
        <TabBar />
        <RegisterServiceWorker />
      </div>
    </div>
  );
}
