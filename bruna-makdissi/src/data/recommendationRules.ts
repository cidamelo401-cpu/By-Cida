/**
 * Motor de recomendação — determinístico, sem IA generativa.
 *
 * Fonte: aba "Direcionamento" do catálogo v1.0 (14 regras aprovadas pela Bruna e
 * pelo Jean). A composição segue a prioridade:
 *
 *   1) historico === 'mentoria_caminho'  → Sustentação (M06), sempre, não importa o resto.
 *   2) senão, tema (Q1) escolhe a família de produtos.
 *   3) disposicao (Q4) escolhe o "andar" da esteira dentro daquele tema
 *      (acessível → jornada/portal/ebook · pontual → mesa avulsa · acompanhamento → diagnóstico).
 *   4) momento (Q2) refina a escolha dentro do andar, quando há mais de uma opção.
 *
 * ============================================================================
 * PREMISSAS ASSUMIDAS (a planilha não cobre 100% das 7×3 combinações possíveis
 * de tema×disposição — o que segue são decisões de UX documentadas, não fatos
 * do catálogo. Revisar com a Bruna antes de considerar definitivo):
 *
 * - dinheiro + pontual: não existe mesa exclusiva de "dinheiro" no catálogo.
 *   Assumido: Mesa das 4 Prosperidades (T03), por ser a mais próxima (inclui
 *   finanças entre as 4 áreas). Marcado com `assumption: true`.
 * - corpo + acessível / relações + acessível: não existe jornada específica
 *   para esses temas (só existem jornadas de dinheiro/espiritual/ansiedade).
 *   Assumido: oferecer o diagnóstico do próprio tema mesmo assim, com CTA mais
 *   leve ("sessão única, sem compromisso de continuidade").
 * - relações + pontual: a regra 5 lista Divórcio Energético (T01) "conforme
 *   disposição", mas o quiz de 4 perguntas não tem um sinal de "rompimento de
 *   vínculo" isolado. Assumido: default para T01. O Luto (T09) fica fora do
 *   alcance automático do quiz atual — não há tema "luto" nem sub-pergunta
 *   para chegar lá; precisa de uma decisão futura (nova opção em Q1, ou
 *   sub-pergunta condicional) se a Bruna quiser essa rota automatizada.
 * - dinheiro + acessível: a regra 1 (dívida/urgência → J01/J02) e a regra 4
 *   (quer prosperar → J03/Portal) não são discrimináveis só com Q2 (momento).
 *   Assumido: momento 'pesado' → J01; 'repete_tempo'/'comecando' → J02. J03 e
 *   o Portal ficam como sugestão dentro do tema "espiritual".
 * - dinheiro + acompanhamento: a regra 2 (empresária) e a regra 3 (pessoa
 *   física) levam ambas a D01 — o quiz não pergunta PF/PJ. Assumido: resultado
 *   sempre D01, com nextStepNote genérico citando as 3 versões da mentoria; a
 *   Bruna decide qual delas na conversa do diagnóstico.
 * - espiritual + acompanhamento: a regra 10 diz "Diagnóstico → Caminho da
 *   Transformação" sem dizer qual diagnóstico. Assumido: resultado difuso
 *   (isDiffuse), com CTA de WhatsApp para definir junto com a Bruna.
 * - ansiedade: a Jornada (J06) está com a versão ao vivo já realizada e a
 *   gravada "em preparação" — ou seja, não está à venda agora. Seguindo a
 *   própria regra 9 ("enquanto a gravada não estiver à venda: Mesa DNB (T05)
 *   ou Mesa da Cura Ascensional (T04)"), o resultado atual aponta para T05,
 *   citando J06 como opção a caminho. Quando J06 abrir vendas, mudar o default
 *   de volta para J06 (ver `ANSIEDADE_JORNADA_DISPONIVEL` abaixo).
 * ============================================================================
 */

import type { QuizAnswers, RecommendationResult } from './types';

/** Ligar quando a versão gravada da Jornada de Ansiedade (J06) entrar à venda. */
const ANSIEDADE_JORNADA_DISPONIVEL = false;

export function getRecommendation(answers: QuizAnswers): RecommendationResult {
  const { tema, momento, historico, disposicao } = answers;

  // Regra 12 (parte 2): já concluiu mentoria/Caminho → Sustentação, sempre.
  if (historico === 'mentoria_caminho') {
    return {
      primaryProductIds: ['M06'],
      nextStepProductIds: [],
      requiresWhatsappToChoose: true,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: null,
      nextStepNote: undefined,
      ruleId: 'sustentacao-por-historico',
    };
  }

  switch (tema) {
    case 'dinheiro':
      return recomendarDinheiro(momento, disposicao);
    case 'corpo':
      return recomendarCorpo(disposicao);
    case 'relacoes':
      return recomendarRelacoes(disposicao);
    case 'casa_empresa':
      return {
        primaryProductIds: ['T02'],
        nextStepProductIds: ['M03'],
        requiresWhatsappToChoose: false,
        isDiffuse: false,
        professionalSupportNotice: false,
        disclaimerKind: null,
        nextStepNote: 'Se o ambiente for de uma empresa, a Mentoria Financeira Energética — Empresa pode ser o passo seguinte.',
        ruleId: 'casa-empresa-limpeza',
      };
    case 'pet':
      return {
        primaryProductIds: ['T07'],
        nextStepProductIds: [],
        requiresWhatsappToChoose: false,
        isDiffuse: false,
        professionalSupportNotice: false,
        disclaimerKind: 'veterinario',
        ruleId: 'pet-mesa-dnb',
      };
    case 'ansiedade':
      return recomendarAnsiedade();
    case 'espiritual':
      return recomendarEspiritual(disposicao);
    default:
      return diffuseFallback();
  }
}

function recomendarDinheiro(momento: QuizAnswers['momento'], disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'acessivel') {
    const primary = momento === 'pesado' ? 'J01' : 'J02';
    return {
      primaryProductIds: [primary],
      nextStepProductIds: ['D01'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: null,
      nextStepNote: 'O Diagnóstico Financeiro é o passo natural depois da jornada, para quem quiser continuar.',
      ruleId: `dinheiro-acessivel-${primary.toLowerCase()}`,
    };
  }

  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T03'],
      nextStepProductIds: ['D01'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: null,
      nextStepNote: 'Não existe uma mesa exclusiva de dinheiro — a das 4 Prosperidades inclui as finanças entre as áreas trabalhadas.',
      ruleId: 'dinheiro-pontual-4prosperidades',
    };
  }

  // acompanhamento
  return {
    primaryProductIds: ['D01'],
    nextStepProductIds: ['M01', 'M02', 'M03'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    disclaimerKind: null,
    nextStepNote: 'Depois do diagnóstico, a Bruna indica a versão da mentoria que faz mais sentido: pessoal, empresário ou empresa.',
    ruleId: 'dinheiro-acompanhamento-diagnostico',
  };
}

function recomendarCorpo(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T11'],
      nextStepProductIds: ['D02'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: 'saude',
      ruleId: 'corpo-pontual-leitura-orgaos',
    };
  }

  // acessível e acompanhamento convergem para o diagnóstico — não há jornada de corpo.
  return {
    primaryProductIds: ['D02'],
    nextStepProductIds: ['M04'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    disclaimerKind: 'saude',
    nextStepNote:
      disposicao === 'acessivel'
        ? 'É uma sessão única, sem compromisso de continuidade — ainda não temos um conteúdo de entrada específico para esse tema.'
        : 'Depois do diagnóstico, a Mentoria do Corpo Consciente pode ser a continuidade, se fizer sentido pra você.',
    ruleId: disposicao === 'acessivel' ? 'corpo-acessivel-diagnostico' : 'corpo-acompanhamento-diagnostico',
  };
}

function recomendarRelacoes(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T01'],
      nextStepProductIds: ['D03'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: null,
      ruleId: 'relacoes-pontual-divorcio-energetico',
    };
  }

  return {
    primaryProductIds: ['D03'],
    nextStepProductIds: ['M05'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    disclaimerKind: null,
    nextStepNote:
      disposicao === 'acessivel'
        ? 'É uma sessão única, sem compromisso de continuidade — ainda não temos um conteúdo de entrada específico para esse tema.'
        : 'Depois do diagnóstico, a Mentoria das Relações pode ser a continuidade, se fizer sentido pra você.',
    ruleId: disposicao === 'acessivel' ? 'relacoes-acessivel-diagnostico' : 'relacoes-acompanhamento-diagnostico',
  };
}

function recomendarAnsiedade(): RecommendationResult {
  if (ANSIEDADE_JORNADA_DISPONIVEL) {
    return {
      primaryProductIds: ['J06'],
      nextStepProductIds: [],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: true,
      disclaimerKind: 'saude_mental',
      ruleId: 'ansiedade-jornada',
    };
  }

  return {
    primaryProductIds: ['T05'],
    nextStepProductIds: [],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: true,
    disclaimerKind: 'saude_mental',
    nextStepNote:
      'A Jornada Desprogramando a Ansiedade está com a versão gravada em preparação — enquanto isso, a Mesa DNB (ou, se preferir, a Mesa da Cura Ascensional) é a opção disponível agora.',
    ruleId: 'ansiedade-mesa-dnb-fallback',
  };
}

function recomendarEspiritual(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'acessivel') {
    return {
      primaryProductIds: ['J05'],
      nextStepProductIds: [],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      disclaimerKind: null,
      ruleId: 'espiritual-acessivel-portal',
    };
  }

  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T06', 'T08', 'T10'],
      nextStepProductIds: [],
      requiresWhatsappToChoose: true,
      isDiffuse: false,
      professionalSupportNotice: false,
      // T08 (Cirurgia Espiritual) pede esse disclaimer no catálogo — como as
      // três mesas aparecem juntas, mostrar por segurança para o trio.
      disclaimerKind: 'saude',
      nextStepNote: 'São três mesas diferentes para temas espirituais — a Bruna ajuda a escolher a certa pelo WhatsApp.',
      ruleId: 'espiritual-pontual-mesas',
    };
  }

  // acompanhamento — a regra fonte não especifica qual diagnóstico usar.
  return diffuseFallback('espiritual-acompanhamento-diagnostico-indefinido');
}

function diffuseFallback(ruleId = 'resultado-difuso'): RecommendationResult {
  return {
    primaryProductIds: [],
    nextStepProductIds: [],
    requiresWhatsappToChoose: true,
    isDiffuse: true,
    professionalSupportNotice: false,
    disclaimerKind: null,
    nextStepNote: 'Um diagnóstico pode ajudar a mapear isso — financeiro, corporal ou de relações, dependendo de onde o sinal aparece mais forte.',
    ruleId,
  };
}
