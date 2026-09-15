import type {
  AvisoMural,
  Evento,
  Facilitadora,
  FotoGaleria,
  ItemChecklist,
  ItemPrograma,
  PostMural,
  SlotMassagem
} from '@/types';

/**
 * DADOS MOCKADOS — não são dados reais de produção.
 * Valores devem ser confirmados pela organizadora (ver CLAUDE.md § 13).
 * Quando o banco existir, este arquivo vira apenas seed.
 */

export const EVENTO: Evento = {
  id: 'mcn-2025-3',
  nome: 'Mães, Conexão e Natureza',
  edicao: 3,
  dataISO: '2025-10-17',
  horaInicio: '10:00',
  horaFim: '17:00',
  local: 'Sítio Anju',
  bioma: 'Mata Atlântica',
  vagasTotais: 25
};

export const MASSAGISTAS = ['Denise', 'Ligia'] as const;

export const PRECO_MASSAGEM_CENTAVOS = 6000;

/** Chave Pix da massagem — CONFIRMAR com a organizadora. */
export const CHAVE_PIX = '61477650000117';

export const INCLUI: string[] = [
  'Café da manhã, almoço e lanche da tarde',
  'Trilha guiada nível iniciante',
  'Yoga leve, dança intuitiva e meditação',
  'Oficina de mandala e dinâmicas em roda'
];

export const PROGRAMA: ItemPrograma[] = [
  { hora: '10:00', titulo: 'Chegada e café da manhã', descricao: 'Recepção, crachá e café caseiro na varanda azul.', responsavel: 'Todas', cor: '#EFC94C' },
  { hora: '10:45', titulo: 'Roda de abertura', descricao: 'Dinâmica focada nas emoções e no alinhamento das suas demandas pessoais.', responsavel: 'Ana Claudia', cor: '#8FAE4B' },
  { hora: '11:30', titulo: 'Trilha nível iniciante', descricao: 'Caminhada guiada pela mata até a cachoeira. Ritmo tranquilo.', responsavel: 'Lethycia', cor: '#5C7A2E' },
  { hora: '12:30', titulo: 'Meditação guiada junto à água', descricao: 'Vinte minutos de silêncio e respiração.', responsavel: 'Lethycia', cor: '#5C7A2E' },
  { hora: '13:00', titulo: 'Almoço', descricao: 'Alimentação saudável e caseira, feita pela @malo.an.', responsavel: 'Todas', cor: '#EFC94C' },
  { hora: '14:15', titulo: 'Yoga leve e dança intuitiva', descricao: 'Integração do corpo. Traga uma canga ou tapetinho.', responsavel: 'Anastacia', cor: '#D5533B' },
  { hora: '15:15', titulo: 'Oficina Mandala', descricao: 'Atividade prática para soltar a criatividade e olhar para dentro.', responsavel: 'Fabiana', cor: '#E0A03A' },
  { hora: '16:15', titulo: 'Pausa na rede + massagem', descricao: 'Descanso livre. Massagens acontecem por horário agendado.', responsavel: 'Livre', cor: '#8FAE4B' },
  { hora: '16:40', titulo: 'Lanche da tarde e roda de encerramento', descricao: 'Partilhas finais e foto do grupo.', responsavel: 'Todas', cor: '#EFC94C' }
];

export const FACILITADORAS: Facilitadora[] = [
  { id: 'f1', nome: 'Ana Claudia', papel: 'Roda de abertura e dinâmicas', instagram: '@anaclaudiasbandrade', iniciais: 'A', cor: '#8FAE4B', foto: '', bio: '' },
  { id: 'f2', nome: 'Lethycia Abreu', papel: 'Trilha e meditação guiada', instagram: '@rosaemterapia', iniciais: 'L', cor: '#D5533B', foto: '', bio: '' },
  { id: 'f3', nome: 'Anastacia Harlamova', papel: 'Yoga leve e dança intuitiva', instagram: '@anastasiaharlamova', iniciais: 'A', cor: '#5C7A2E', foto: '', bio: '' },
  { id: 'f4', nome: 'Fabiana Franco', papel: 'Oficina Mandala', instagram: '@fabianafranco.psico', iniciais: 'F', cor: '#E0A03A', foto: '', bio: '' }
];

export const CHECKLIST: ItemChecklist[] = [
  { id: 'c1', texto: 'Tênis ou bota leve para a trilha' },
  { id: 'c2', texto: 'Canga ou tapetinho para o yoga' },
  { id: 'c3', texto: 'Garrafa de água reutilizável' },
  { id: 'c4', texto: 'Roupa de banho e toalha' },
  { id: 'c5', texto: 'Repelente e protetor solar' },
  { id: 'c6', texto: 'Blusa de frio para o fim da tarde' },
  { id: 'c7', texto: 'Uma foto sua de quando era criança' }
];

export const CHECKLIST_NOTA =
  'A foto de criança é usada na roda de encerramento. Pode ser no celular, mas impressa emociona mais.';

/**
 * Agenda real enviada pela organizadora (planilha de 14/09).
 * Duas massagistas em paralelo, blocos de 30 min das 10h30 às 16h30.
 * String vazia = livre. 'almoço' bloqueia o horário.
 */
export const SLOTS_MASSAGEM: SlotMassagem[] = [
  { faixa: '10h30 às 11h', denise: '', ligia: '' },
  { faixa: '11h às 11h30', denise: 'Vanessa Coelho', ligia: 'Léia Valleo' },
  { faixa: '11h30 às 12h', denise: '', ligia: '' },
  { faixa: '12h às 12h30', denise: '', ligia: '' },
  { faixa: '12h30 às 13h', denise: 'Thaís Gazeta', ligia: '' },
  { faixa: '13h às 13h30', denise: 'Thaís Gazeta', ligia: 'Marcela Queiroz' },
  { faixa: '13h30 às 14h', denise: 'Aline Dias', ligia: 'Anne Cristine' },
  { faixa: '14h às 14h30', denise: 'almoço', ligia: 'almoço' },
  { faixa: '14h30 às 15h', denise: 'Kamila Teixeira', ligia: 'Luna Teixeira' },
  { faixa: '15h às 15h30', denise: 'Paula Durelli', ligia: 'Silma França' },
  { faixa: '15h30 às 16h', denise: 'Janete Aparecida', ligia: 'Érica Cristina' },
  { faixa: '16h às 16h30', denise: 'Nívea Vieira', ligia: '' }
];

export const AVISO_MURAL: AvisoMural = {
  titulo: 'Aviso das facilitadoras',
  texto: 'Chegue até 10h para não perder o café. O portão fecha às 10h30 e reabre no fim do dia.'
};

export const MURAL: PostMural[] = [
  { id: 'p1', autora: 'Carol', iniciais: 'C', cor: '#D5533B', texto: 'Alguém vindo da zona sul quer dividir carona? Saio às 8h30 de Santo Amaro.', quando: 'há 2 h', reacoes: 4 },
  { id: 'p2', autora: 'Juliana', iniciais: 'J', cor: '#8FAE4B', texto: 'É a minha primeira vez. Estou nervosa e animada ao mesmo tempo!', quando: 'há 5 h', reacoes: 11 },
  { id: 'p3', autora: 'Ana Claudia', iniciais: 'A', cor: '#1E3123', texto: 'Meninas, a trilha é tranquila mas o chão fica úmido. Tênis fechado ajuda muito.', quando: 'ontem', reacoes: 8 }
];

export const LOCAL_INFO = {
  endereco: 'Estrada do Sítio Anju · Mata Atlântica\nGrande São Paulo',
  comoChegar:
    'Cerca de 1h20 saindo da zona sul de São Paulo. Os últimos 2 km são de estrada de terra, tranquila para carro baixo em tempo seco.',
  bomSaber:
    'Estacionamento gratuito no sítio · sinal de celular fraco em parte da mata · cachoeira com poço raso, banho permitido · evento apenas para mães, sem crianças.'
};

export const FOTO_LIMPA = { src: '/img/cachoeira.jpeg', alt: 'Roda de mães na grama diante da cachoeira do Sítio Anju' };

export const GALERIA: FotoGaleria[] = [
  { src: '/img/edicoes.jpeg', alt: 'Mosaico de fotos das edições anteriores do evento', legendaGravada: true },
  { src: '/img/trilha.jpeg', alt: 'Grupo em fila na trilha entre a vegetação', legendaGravada: true },
  { src: '/img/mandala.jpeg', alt: 'Mãos pintando uma mandala na oficina', legendaGravada: true },
  { src: '/img/yoga.jpeg', alt: 'Mães em pé sobre cangas coloridas na grama durante a prática de yoga', legendaGravada: true },
  { src: '/img/roda.jpeg', alt: 'Roda de mãos dadas no gramado em frente à casa', legendaGravada: true },
  { src: '/img/refeicoes.jpeg', alt: 'Mesa comprida montada na grama para o almoço', legendaGravada: true }
];
