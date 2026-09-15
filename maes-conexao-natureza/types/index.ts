/** Tipos do domínio — alinhados ao ESCOPO-ATUAL. */

export type ScreenId =
  | 'home'
  | 'cadastro'
  | 'inscricao'
  | 'programa'
  | 'facilitadoras'
  | 'local'
  | 'checklist'
  | 'massagem'
  | 'galeria'
  | 'mural';

export interface Evento {
  id: string;
  nome: string;
  edicao: number;
  dataISO: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  bioma: string;
  vagasTotais: number;
}

export interface ItemPrograma {
  hora: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  cor: string;
}

export interface Facilitadora {
  id: string;
  nome: string;
  papel: string;
  instagram: string;
  iniciais: string;
  cor: string;
  foto: string;
  bio: string;
}

export interface ItemChecklist {
  id: string;
  texto: string;
}

export interface SlotMassagem {
  faixa: string;
  denise: string;
  ligia: string;
}

export interface PostMural {
  id: string;
  autora: string;
  iniciais: string;
  cor: string;
  texto: string;
  quando: string;
  reacoes: number;
}

export interface AvisoMural {
  titulo: string;
  texto: string;
}

export interface FotoGaleria {
  src: string;
  alt: string;
  legendaGravada: boolean;
}

export interface Participante {
  id: string;
  nome: string;
  whatsapp: string;
  criadoEm: string;
}
