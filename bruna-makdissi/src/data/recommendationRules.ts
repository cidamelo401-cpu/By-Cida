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
 *   Assumido: Mesa das 4 Prosperidades (T03) + Mesa DNB (T05), como duas
 *   opções pontuais — a Bruna ajuda a decidir qual pelo WhatsApp. Decisão da
 *   Cida (pedido direto): antes só oferecia T03; T05 entrou porque já é
 *   usada nesse mesmo padrão pro tema espiritual (mesa "mais completa",
 *   flexível o bastante pra qualquer área da vida).
 * - corpo + acessível / relações + acessível: não existe jornada específica
 *   para esses temas (só existem jornadas de dinheiro/espiritual/ansiedade).
 *   Assumido: oferecer o diagnóstico do próprio tema mesmo assim.
 * - relações + pontual: a regra 5 lista Divórcio Energético (T01) "conforme
 *   disposição", mas o quiz de 4 perguntas não tem um sinal de "rompimento de
 *   vínculo" isolado. Assumido: default para T01.
 * - luto: adicionado como 8ª opção de tema em Q1 (pedido direto da Cida, após
 *   o gap ficar visível na revisão do quiz ao vivo). Vai direto pra Mesa do
 *   Luto, Morte e Encaminhamento (T09), ignorando momento/histórico/disposição
 *   — é uma mesa avulsa sem diagnóstico/mentoria correspondente no catálogo,
 *   mesmo padrão de pet/casa_empresa. O bloco "Cuidado" acolhedor e sem
 *   promessa vem pronto do texto de T09 em `resultContent.ts`.
 * - fluxo curto (luto, pet, casa_empresa): como histórico/disposição não
 *   mudam o resultado desses temas, o quiz pula as duas perguntas — só
 *   pergunta tema e momento, depois vai direto pra captura de lead (ver
 *   `SHORT_FLOW_TEMAS` em `questions.ts` e `SHORT_QUESTIONS` em
 *   `QuizFlow.tsx`). Decisão explícita da Cida, no mesmo trade-off pros três
 *   temas: quem já concluiu mentoria/Caminho e escolhe um deles NÃO é
 *   desviado pra Sustentação (M06) — a checagem de histórico roda antes do
 *   switch de tema, mas como o quiz nem pergunta histórico nesse caminho, ele
 *   sempre chega aqui como 'nenhum' e cai direto na mesa do tema escolhido.
 * - dinheiro + acessível: a regra 1 (dívida/urgência → J01/J02) e a regra 4
 *   (quer prosperar → J03/Portal) não são discrimináveis só com Q2 (momento).
 *   Assumido: momento 'pesado' → J01; 'repete_tempo'/'comecando' → J02. J03 e
 *   o Portal ficam como sugestão dentro do tema "espiritual".
 * - dinheiro + acompanhamento: a regra 2 (empresária) e a regra 3 (pessoa
 *   física) levam ambas a D01 — o quiz não pergunta PF/PJ. Assumido: resultado
 *   sempre D01; a Bruna decide qual versão da mentoria (pessoal, empresário
 *   ou empresa) faz sentido na conversa do diagnóstico.
 * - espiritual + intensivo: a matriz de conteúdo da Cida ("Matriz de conteúdo
 *   dos resultados — Direcionamento Bruna Makdissi") cobre exatamente esse
 *   caso com um bloco próprio do Caminho da Transformação ("mais de uma área
 *   parece estar pedindo atenção, e você busca um processo concentrado").
 *   Por isso o resultado principal passou a ser C01 direto, em vez do trio de
 *   diagnósticos com C01 como próximo passo.
 * - espiritual + acompanhamento: a regra 10 diz "Diagnóstico → Caminho da
 *   Transformação" sem dizer qual diagnóstico, e a matriz de conteúdo não tem
 *   um bloco específico pra esse caso. Decisão da Cida: reusar o mesmo bloco
 *   do Caminho da Transformação (C01) usado em "espiritual + intensivo" — é
 *   o único conteúdo da matriz que fala de "mais de uma área" sem cravar um
 *   tema único, mesmo o encaixe não sendo perfeito (essa pessoa quer
 *   acompanhamento, não processo intensivo).
 * - ansiedade: a Jornada (J06) está com a versão ao vivo já realizada e a
 *   gravada "em preparação" — ou seja, não está à venda agora. Seguindo a
 *   própria regra 9 ("enquanto a gravada não estiver à venda: Mesa DNB (T05)
 *   ou Mesa da Cura Ascensional (T04)"), o resultado atual aponta para T05,
 *   citando J06 como opção a caminho. Quando J06 abrir vendas, mudar o default
 *   de volta para J06 (ver `ANSIEDADE_JORNADA_DISPONIVEL` abaixo).
 *
 * `nextStepNote` só existe (e só é usada na tela) quando há mais de um
 * produto principal — é o texto de apoio tipo "a Bruna ajuda a escolher pelo
 * WhatsApp". Nunca vai pra mensagem de WhatsApp que a cliente manda (ver
 * `whatsappTemplates.ts`) — seria expor um raciocínio interno do site pra
 * própria Bruna, o que não faz sentido.
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
      requiresWhatsappToChoose: true,
      isDiffuse: false,
      professionalSupportNotice: false,
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
        requiresWhatsappToChoose: false,
        isDiffuse: false,
        professionalSupportNotice: false,
        ruleId: 'casa-empresa-limpeza',
      };
    case 'pet':
      return {
        primaryProductIds: ['T07'],
        requiresWhatsappToChoose: false,
        isDiffuse: false,
        professionalSupportNotice: false,
        ruleId: 'pet-mesa-dnb',
      };
    case 'ansiedade':
      return recomendarAnsiedade();
    case 'espiritual':
      return recomendarEspiritual(disposicao);
    case 'luto':
      return {
        primaryProductIds: ['T09'],
        requiresWhatsappToChoose: false,
        isDiffuse: false,
        professionalSupportNotice: false,
        ruleId: 'luto-mesa',
      };
    default:
      return diffuseFallback();
  }
}

function recomendarDinheiro(momento: QuizAnswers['momento'], disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'acessivel') {
    const primary = momento === 'pesado' ? 'J01' : 'J02';
    return {
      primaryProductIds: [primary],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: `dinheiro-acessivel-${primary.toLowerCase()}`,
    };
  }

  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T03', 'T05'],
      requiresWhatsappToChoose: true,
      isDiffuse: false,
      professionalSupportNotice: false,
      nextStepNote: 'São duas mesas diferentes para o tema dinheiro — a Bruna ajuda a escolher a certa pelo WhatsApp.',
      ruleId: 'dinheiro-pontual-mesas',
    };
  }

  if (disposicao === 'intensivo') {
    return {
      primaryProductIds: ['D01'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'dinheiro-intensivo-caminho',
    };
  }

  // acompanhamento
  return {
    primaryProductIds: ['D01'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    ruleId: 'dinheiro-acompanhamento-diagnostico',
  };
}

function recomendarCorpo(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T11'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'corpo-pontual-leitura-orgaos',
    };
  }

  if (disposicao === 'intensivo') {
    return {
      primaryProductIds: ['D02'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'corpo-intensivo-caminho',
    };
  }

  // acessível e acompanhamento convergem para o diagnóstico — não há jornada de corpo.
  return {
    primaryProductIds: ['D02'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    ruleId: disposicao === 'acessivel' ? 'corpo-acessivel-diagnostico' : 'corpo-acompanhamento-diagnostico',
  };
}

function recomendarRelacoes(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T01'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'relacoes-pontual-divorcio-energetico',
    };
  }

  if (disposicao === 'intensivo') {
    return {
      primaryProductIds: ['D03'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'relacoes-intensivo-caminho',
    };
  }

  return {
    primaryProductIds: ['D03'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    ruleId: disposicao === 'acessivel' ? 'relacoes-acessivel-diagnostico' : 'relacoes-acompanhamento-diagnostico',
  };
}

function recomendarAnsiedade(): RecommendationResult {
  if (ANSIEDADE_JORNADA_DISPONIVEL) {
    return {
      primaryProductIds: ['J06'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: true,
      ruleId: 'ansiedade-jornada',
    };
  }

  return {
    primaryProductIds: ['T05'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: true,
    ruleId: 'ansiedade-mesa-dnb-fallback',
  };
}

function recomendarEspiritual(disposicao: QuizAnswers['disposicao']): RecommendationResult {
  if (disposicao === 'acessivel') {
    return {
      primaryProductIds: ['J05'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'espiritual-acessivel-portal',
    };
  }

  if (disposicao === 'pontual') {
    return {
      primaryProductIds: ['T06', 'T08', 'T10'],
      requiresWhatsappToChoose: true,
      isDiffuse: false,
      professionalSupportNotice: false,
      nextStepNote: 'São três mesas diferentes para temas espirituais — a Bruna ajuda a escolher a certa pelo WhatsApp.',
      ruleId: 'espiritual-pontual-mesas',
    };
  }

  if (disposicao === 'intensivo') {
    return {
      primaryProductIds: ['C01'],
      requiresWhatsappToChoose: false,
      isDiffuse: false,
      professionalSupportNotice: false,
      ruleId: 'espiritual-intensivo-caminho',
    };
  }

  // acompanhamento — a regra fonte não especifica qual diagnóstico usar; a
  // matriz de conteúdo da Cida não tem um bloco próprio pra esse caso (só
  // cobre "espiritual + intensivo" com o Caminho da Transformação). Decisão
  // dela: usar o mesmo conteúdo do Caminho aqui também — é o único bloco da
  // matriz que fala de "mais de uma área" sem cravar um tema único.
  return {
    primaryProductIds: ['C01'],
    requiresWhatsappToChoose: false,
    isDiffuse: false,
    professionalSupportNotice: false,
    ruleId: 'espiritual-acompanhamento-diagnostico-indefinido',
  };
}

/**
 * Rede de segurança pro `default:` do switch de tema — hoje inalcançável na
 * prática, já que as 8 opções de `TemaId` são todas tratadas explicitamente
 * acima. Mantido só por exaustividade de tipo. Se algum dia isso disparar de
 * verdade, ainda assim ninguém sai sem produto nomeado pra levar pro
 * WhatsApp.
 */
function diffuseFallback(): RecommendationResult {
  return {
    primaryProductIds: ['D01', 'D02', 'D03'],
    requiresWhatsappToChoose: true,
    isDiffuse: true,
    professionalSupportNotice: false,
    nextStepNote: 'Um diagnóstico pode ajudar a mapear isso — financeiro, corporal ou de relações, dependendo de onde o sinal aparece mais forte.',
    ruleId: 'resultado-difuso',
  };
}
