'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHECKLIST } from '@/services/eventData';

const STORAGE_KEY = 'mcn.checklist.v1';

/** Checklist da mochila: estado local por dispositivo, persistido em localStorage. */
export function useChecklist() {
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMarcados(JSON.parse(raw));
    } catch {
      /* storage indisponível: segue em memória */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setMarcados((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });
  }, []);

  const feitos = Object.keys(marcados).filter((k) => marcados[k]).length;

  return { marcados, toggle, feitos, total: CHECKLIST.length };
}
