import type { ScreenId } from '@/types';

export const ROUTES: Record<ScreenId, string> = {
  home: '/',
  cadastro: '/cadastro',
  inscricao: '/inscricao',
  programa: '/programa',
  facilitadoras: '/facilitadoras',
  local: '/local',
  checklist: '/checklist',
  massagem: '/massagem',
  galeria: '/galeria',
  mural: '/mural'
};

export const TABS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Início' },
  { id: 'programa', label: 'Programa' },
  { id: 'massagem', label: 'Massagem' },
  { id: 'mural', label: 'Comunidade' }
];

export const SAFE_TOP_PX = 60;
export const SAFE_BOTTOM_PX = 28;
