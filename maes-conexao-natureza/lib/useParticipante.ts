'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Participante } from '@/types';

const STORAGE_KEY = 'mcn_participante';

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useParticipante() {
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setParticipante(JSON.parse(raw));
    } catch { /* storage indisponível */ }
    setCarregando(false);
  }, []);

  const entrar = useCallback((nome: string, whatsapp: string) => {
    const p: Participante = {
      id: gerarId(),
      nome: nome.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      criadoEm: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch { /* ignora */ }
    setParticipante(p);
  }, []);

  const sair = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignora */ }
    setParticipante(null);
  }, []);

  return { participante, carregando, entrar, sair };
}
