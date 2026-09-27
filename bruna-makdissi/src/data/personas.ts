/**
 * Personas mapeadas pela Bruna (aba "Personas" do catálogo v1.0).
 * Uso: copywriting da landing e ajuste fino de tom por segmento. Não alimenta
 * o motor de recomendação diretamente — o quiz não pergunta "qual persona você é".
 */

import type { Persona } from './types';

export const personas: Persona[] = [
  {
    id: 'empresaria-autonoma',
    nome: 'Empresária / Autônoma',
    doresRegistradas: ['Oscilação financeira/de caixa', 'Trava para precificar e vender', 'Pressão', 'Autoexigência', 'Insegurança para crescer'],
    desejosRegistrados: ['Prosperidade sustentável', 'Estabilidade', 'Expansão', 'Confiança'],
    produtosOndeAparece: ['D01', 'M02', 'M03', 'J05', 'J04', 'J02', 'J03'],
    objecoesTipicas: ['É investimento alto', 'Não tenho tempo', 'Não sei se funciona pra mim'],
    canais: ['Indicação', 'WhatsApp', 'Instagram'],
  },
  {
    id: 'pf-clt-contas-apertadas',
    nome: 'Pessoa física / CLT com contas apertadas',
    doresRegistradas: ['Medo de faltar', 'Gastos impulsivos', 'Cartão estourado', 'Rotina corrida'],
    desejosRegistrados: ['Segurança financeira', 'Mudança de mentalidade', 'Equilíbrio'],
    produtosOndeAparece: ['J02', 'J01', 'D01', 'M01'],
    objecoesTipicas: ['Não tenho tempo', 'Valor recorrente'],
    canais: ['Instagram', 'TikTok', 'WhatsApp'],
  },
  {
    id: 'endividada-cronica',
    nome: 'Endividada crônica / vergonha financeira',
    doresRegistradas: ['Endividamento', 'Ansiedade', 'Autoimagem ruim', 'Paralisia', 'Vergonha'],
    desejosRegistrados: ['Sair do ciclo', 'Recuperar controle', 'Alívio', 'Plano simples', 'Esperança'],
    produtosOndeAparece: ['J01', 'J04', 'J02'],
    objecoesTipicas: ['Tenho vergonha', 'Não posso pagar', 'Minha situação é grave'],
    canais: ['WhatsApp', 'Instagram', 'Indicação'],
  },
  {
    id: 'mulher-transicao-cura-emocional',
    nome: 'Mulher em transição / cura emocional',
    doresRegistradas: ['Crenças limitantes', 'Falta de clareza', 'Autossabotagem', 'Feridas parentais'],
    desejosRegistrados: ['Clareza e foco', 'Leveza emocional', 'Merecimento', 'Autoestima'],
    produtosOndeAparece: ['J03', 'D03', 'M05', 'T06', 'T09'],
    objecoesTipicas: ['Já fiz terapia', 'Isso me gatilha'],
    canais: ['Instagram', 'WhatsApp'],
  },
  {
    id: 'buscadora-espiritual',
    nome: 'Buscadora espiritual',
    doresRegistradas: ['Trava de prosperidade', 'Falta de fluidez', 'Sensação de bloqueio', "'Tem algo mais'"],
    desejosRegistrados: ['Abertura de caminhos', 'Conexão', 'Fluxo', 'Leveza'],
    produtosOndeAparece: ['J05', 'T03', 'T04', 'T05', 'T06', 'T08', 'T10', 'J04', 'J03'],
    objecoesTipicas: ['Não entendo o portal', 'Não sei acompanhar ao vivo'],
    canais: ['WhatsApp', 'Instagram'],
  },
  {
    id: 'mulher-exausta-crise',
    nome: 'Mulher exausta / em crise',
    doresRegistradas: ['Ciclo repetitivo de perdas', 'Peso emocional', 'Autoculpa', 'Medo', 'Ansiedade'],
    desejosRegistrados: ['Limpeza', 'Quebra de padrões', 'Recomeço', 'Proteção', 'Paz'],
    produtosOndeAparece: ['J04', 'J06', 'T05'],
    objecoesTipicas: ['É muito intenso', 'Tenho medo do tema', 'Não vou conseguir manter 40 dias'],
    canais: ['WhatsApp', 'Indicação'],
  },
  {
    id: 'pessoa-corpo-emagrecimento',
    nome: 'Pessoa com questão de corpo / emagrecimento',
    doresRegistradas: ['Ciclo de dietas e recaídas', 'Autoimagem ruim', 'Ansiedade com comida'],
    desejosRegistrados: ['Leveza', 'Constância', 'Paz com o corpo'],
    produtosOndeAparece: ['D02', 'M04', 'T11'],
    objecoesTipicas: ['Já fiz nutricionista', 'Isso é muito místico'],
    canais: ['Instagram', 'WhatsApp'],
  },
  {
    id: 'tutor-de-pet',
    nome: 'Tutor de pet',
    doresRegistradas: ['Animal com sintomas/comportamentos que se repetem'],
    desejosRegistrados: ['Equilíbrio para o pet e para si'],
    produtosOndeAparece: ['T07'],
    objecoesTipicas: ['Funciona à distância?', 'Nunca fiz mesa'],
    canais: ['Instagram', 'WhatsApp'],
  },
  {
    id: 'aluna-recorrente',
    nome: 'Aluna recorrente / ex-cliente',
    doresRegistradas: ['Falta de constância', 'Sensação de estar sozinha', 'Dúvidas contínuas'],
    desejosRegistrados: ['Pertencimento', 'Acompanhamento', 'Direcionamento'],
    produtosOndeAparece: ['D01', 'D02', 'D03', 'M06', 'J05'],
    objecoesTipicas: ['Não gosto de grupos', 'Valor recorrente'],
    canais: ['WhatsApp (grupo informativo)'],
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
