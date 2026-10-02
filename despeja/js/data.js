// Despeja! — dados de referência (projetos e tipos de item).

export const PROJETOS = [
  { id: 'pessoal',  nome: 'Pessoal',             emoji: '🌿', tone: 'green' },
  { id: 'familia',  nome: 'Família',             emoji: '🏡', tone: 'pink' },
  { id: 'trabalho', nome: 'Trabalho',            emoji: '💼', tone: 'blue' },
  { id: 'hotel',    nome: 'Hotel',               emoji: '🛎️', tone: 'yellow' },
  { id: 'mae',      nome: 'Mulher Além de Mãe',  emoji: '💜', tone: 'lilac' },
  { id: 'bycida',   nome: 'ByCida',              emoji: '✨', tone: 'pink' },
];
export const projetoPorId = (id) => PROJETOS.find((p) => p.id === id) || null;

// Ideia NÃO vira tarefa automaticamente: são tipos separados.
export const ORDEM_TIPOS = ['tarefa', 'ideia', 'lembrete'];
export const TIPOS = {
  tarefa:   { label: 'Tarefa',   singular: 'tarefa',   plural: 'tarefas',   secao: 'Tarefas',   tone: 'pink' },
  ideia:    { label: 'Ideia',    singular: 'ideia',    plural: 'ideias',    secao: 'Ideias',    tone: 'yellow' },
  lembrete: { label: 'Lembrete', singular: 'lembrete', plural: 'lembretes', secao: 'Lembretes', tone: 'blue' },
};

let contador = 0;
export const uid = () => `${Date.now().toString(36)}${(contador++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
