/**
 * Conteúdo editorial da tela de resultado, por produto.
 *
 * Fonte única: "Matriz de conteúdo dos resultados — Direcionamento Bruna
 * Makdissi" (arquivo enviado pela Cida). Transcrição literal — nenhum texto
 * foi alterado, resumido ou reescrito. Onde a matriz listava mais de 4
 * insights possíveis, os 4 primeiros foram mantidos (regra da própria
 * matriz: "Exibir de 2 a 4 insightText relevantes").
 *
 * Cobertura: as 28 entradas da matriz mapeiam 1:1 com os 28 produtos de
 * `services.ts` (ver comentário "Entrada N" acima de cada bloco). Produtos
 * ainda não alcançáveis pelo quiz (T04, J03, J04, J06) têm o conteúdo pronto
 * aqui, esperando serem ligados no motor de recomendação no futuro.
 */

import type { DisposicaoId, QuizAnswers } from './types';

export interface InsightBullet {
  text: string;
  /** undefined = sempre exibir para quem chega nesse produto. */
  when?: (answers: QuizAnswers) => boolean;
}

export interface ResultContent {
  productId: string;
  direcionamento: string;
  entendendoEsseMomento: string[];
  insights: InsightBullet[];
  caminhoLabel: string;
  productHeading: string;
  productExplanation: string[];
  comoFunciona: string[];
  investimento?: string[];
  disponibilidade?: string[];
  cuidado?: string;
  cta: string;
}

const disposicaoIs = (id: DisposicaoId) => (a: QuizAnswers) => a.disposicao === id;

export const resultContent: ResultContent[] = [
  // ---------- Entrada 1 ----------
  {
    productId: 'D01',
    direcionamento: 'Sua relação com o dinheiro está pedindo um olhar mais atento.',
    entendendoEsseMomento: [
      'Nem sempre uma dificuldade financeira aparece apenas nos números. Às vezes, a pessoa trabalha, se esforça e até vê o dinheiro entrar, mas continua percebendo situações que se repetem: medo de faltar, dificuldade de receber, insegurança para cobrar, oscilações ou a sensação de não conseguir avançar.',
      'Pelas suas respostas, entender melhor a forma como você se relaciona com o dinheiro pode ser mais importante agora do que tentar escolher uma solução antes de saber o que está por trás desse padrão.',
    ],
    insights: [
      { text: 'você percebe situações financeiras que se repetem' },
      { text: 'sente dificuldade para entender por onde começar' },
      { text: 'o dinheiro é hoje uma fonte importante de preocupação' },
      { text: 'busca um acompanhamento mais individual para olhar essa questão', when: disposicaoIs('acompanhamento') },
      { text: 'percebe que sua relação com dinheiro também interfere nas suas decisões' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL PARA O SEU MOMENTO',
    productHeading: 'Diagnóstico Financeiro',
    productExplanation: [
      'O Diagnóstico Financeiro é uma sessão individual para olhar, dentro da abordagem da Bruna, em que momento você está e quais bloqueios e dinâmicas aparecem na sua relação com o dinheiro. A proposta é transformar uma sensação ampla de "algo está travado" em um ponto de partida mais claro.',
      'Ao final, a Bruna indica qual caminho faz mais sentido a partir do que foi identificado: uma mentoria, o Caminho da Transformação ou um atendimento pontual.',
    ],
    comoFunciona: ['1 sessão individual', '1 hora', 'Online', 'Leitura do estágio atual e dos bloqueios', 'Indicação do próximo passo'],
    investimento: ['R$ 530', 'Parcelamento em até 12x sem acréscimo.'],
    cuidado: 'O termo "diagnóstico" é utilizado aqui no contexto da leitura energética da Bruna. Não se trata de diagnóstico clínico nem de promessa de resultado financeiro.',
    cta: 'Agendar meu diagnóstico',
  },
  // ---------- Entrada 2 ----------
  {
    productId: 'D02',
    direcionamento: 'Sua relação com o corpo aparece como um ponto importante neste momento.',
    entendendoEsseMomento: [
      'Quando a relação com o corpo vira um ciclo de tentativas, cobranças e recomeços, pode surgir a sensação de que olhar apenas para hábitos e números não responde a tudo o que você está vivendo.',
      'Pelas suas respostas, parece fazer sentido compreender essa relação de forma mais ampla antes de escolher um processo mais longo. A proposta aqui não é explicar o seu corpo por uma única causa, mas criar um ponto de partida para olhar o que se repete na sua experiência.',
    ],
    insights: [
      { text: 'você sente que já tentou mudar essa relação outras vezes' },
      { text: 'percebe um ciclo de tentativas e recaídas' },
      { text: 'sua relação emocional com o corpo também pesa' },
      { text: 'busca compreender essa questão para além de uma solução pontual' },
      { text: 'gostaria de um acompanhamento mais individual', when: disposicaoIs('acompanhamento') },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL PARA O SEU MOMENTO',
    productHeading: 'Diagnóstico Corporal — Corpo Consciente',
    productExplanation: [
      'É uma sessão individual em que a Bruna aplica o Mapa da Evolução da Alma ao tema do corpo. A proposta é mapear o momento atual e os bloqueios percebidos dentro da abordagem energética do trabalho.',
      'A partir dessa leitura, a Bruna pode indicar a Mentoria do Corpo Consciente, o Caminho da Transformação, a Leitura Energética dos Órgãos ou outro atendimento pontual.',
    ],
    comoFunciona: ['1 sessão individual', '1 hora', 'Online', 'Mapeamento do momento atual', 'Indicação do próximo passo'],
    investimento: ['R$ 530', 'Parcelamento em até 12x sem acréscimo.'],
    cuidado: 'Este trabalho é complementar e não substitui acompanhamento médico, nutricional, psicológico ou de outros profissionais de saúde. Não há promessa de emagrecimento.',
    cta: 'Agendar meu diagnóstico',
  },
  // ---------- Entrada 3 ----------
  {
    productId: 'D03',
    direcionamento: 'Alguns padrões nas suas relações parecem estar pedindo atenção.',
    entendendoEsseMomento: [
      'Às vezes as pessoas mudam, os contextos mudam, mas certas sensações continuam voltando. Pode ser a dificuldade de colocar limites, de se desvincular, de receber, de ocupar o próprio espaço ou simplesmente a impressão de estar vivendo versões diferentes de uma história parecida.',
      'Pelas suas respostas, antes de tentar "consertar" uma relação específica, pode fazer sentido olhar para o padrão que você percebe se repetindo.',
    ],
    insights: [
      { text: 'você percebe padrões que se repetem em seus vínculos' },
      { text: 'sente dificuldade para estabelecer ou sustentar limites' },
      { text: 'existe uma relação ou dinâmica que ainda ocupa espaço' },
      { text: 'percebe questões familiares atravessando suas relações' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL PARA O SEU MOMENTO',
    productHeading: 'Diagnóstico de Relações',
    productExplanation: [
      'Uma sessão individual para mapear, dentro da abordagem da Bruna, o momento atual e os bloqueios percebidos nos seus relacionamentos, sejam eles amorosos, familiares ou outros vínculos importantes.',
      'Ao final, a Bruna indica se o próximo passo faz mais sentido como Mentoria das Relações, Caminho da Transformação ou um atendimento pontual, como a Mesa do Divórcio Energético.',
    ],
    comoFunciona: ['1 sessão individual', '1 hora', 'Online', 'Mapeamento dos padrões percebidos', 'Indicação do próximo passo'],
    investimento: ['R$ 530', 'Parcelamento em até 12x sem acréscimo.'],
    cuidado: 'Este atendimento não é terapia ou acompanhamento psicológico.',
    cta: 'Agendar meu diagnóstico',
  },
  // ---------- Entrada 4 ----------
  {
    productId: 'M01',
    direcionamento: 'Você não quer apenas entender o padrão financeiro. Quer trabalhar nele com acompanhamento.',
    entendendoEsseMomento: [
      'Perceber que uma dificuldade se repete é diferente de ter espaço, método e continuidade para trabalhar sobre ela. Quando o tema financeiro atravessa decisões, segurança, medo de faltar, dívidas ou dificuldade de receber, uma ação isolada pode não ser o formato que você procura.',
      'Pelas suas respostas, o que aparece é uma busca por acompanhamento individual e continuidade.',
    ],
    insights: [
      { text: 'você percebe um padrão financeiro que se repete' },
      { text: 'quer acompanhamento em vez de uma ação pontual' },
      { text: 'está disposta a manter práticas ao longo do processo' },
      { text: 'busca mais clareza e constância na forma como lida com dinheiro' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Mentoria Financeira Energética — Pessoa Física',
    productExplanation: [
      'A mentoria é um processo individual de dez semanas construído a partir do Diagnóstico Financeiro. O diagnóstico define o foco e a sequência do trabalho, e os encontros seguintes aprofundam a relação da pessoa com o dinheiro por meio da abordagem da Bruna, práticas semanais e acompanhamento entre as sessões.',
      'A entrada na mentoria acontece pelo Diagnóstico Financeiro.',
    ],
    comoFunciona: [
      'Pré-requisito: Diagnóstico Financeiro',
      '10 semanas',
      '1 encontro individual por semana',
      'Online',
      'Plano de ação por sessão',
      'Práticas e áudios personalizados',
      'Acesso à plataforma e ao planner',
      'Acompanhamento no WhatsApp',
    ],
    investimento: ['Sob consulta.', 'O valor da mentoria não deve ser exibido no site.'],
    cuidado: 'Não há promessa de renda, quitação de dívida ou resultado financeiro específico.',
    cta: 'Agendar o Diagnóstico Financeiro',
  },
  // ---------- Entrada 5 ----------
  {
    productId: 'M02',
    direcionamento: 'A relação entre você, dinheiro e negócio merece ser olhada em conjunto.',
    entendendoEsseMomento: [
      'Empreender mistura decisões financeiras com identidade, pressão, vendas, precificação e responsabilidade. Em alguns momentos, fica difícil separar o que é uma questão operacional do negócio e o que também passa pela forma como o próprio empresário se relaciona com dinheiro e crescimento.',
      'Pelas suas respostas, o foco parece estar em você como empresário e na maneira como essa relação atravessa o negócio.',
    ],
    insights: [
      { text: 'você percebe oscilações financeiras ou insegurança no negócio' },
      { text: 'precificar ou vender também aparece como uma dificuldade' },
      { text: 'sente pressão ou autoexigência em relação à empresa' },
      { text: 'quer trabalhar sua própria relação com dinheiro dentro do contexto empresarial' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Mentoria Financeira Energética — Empresário',
    productExplanation: [
      'É um acompanhamento individual de dez semanas voltado ao empresário como pessoa. A partir do Diagnóstico Financeiro, a Bruna trabalha os temas identificados na relação com dinheiro, precificação, vendas, pressão e identidade empresarial, dentro da abordagem energética do método.',
    ],
    comoFunciona: [
      'Pré-requisito: Diagnóstico Financeiro',
      '10 semanas',
      '1 encontro individual por semana',
      'Online',
      'Mapeamento empresarial energético',
      'Plano de ação',
      'Práticas e áudios personalizados',
      'Plataforma, planner e acompanhamento no WhatsApp',
    ],
    investimento: ['Sob consulta.'],
    cuidado: 'O trabalho não promete aumento de faturamento, vendas ou crescimento empresarial.',
    cta: 'Agendar o Diagnóstico Financeiro',
  },
  // ---------- Entrada 6 ----------
  {
    productId: 'M03',
    direcionamento: 'O ponto de atenção parece estar na empresa como um sistema, não apenas em você.',
    entendendoEsseMomento: [
      'Uma empresa reúne pessoas, decisões, caixa, relações entre sócios, equipe e ambiente. Quando a sensação de bloqueio parece pertencer ao negócio como um todo, olhar apenas para a experiência pessoal do dono pode não corresponder ao que você está buscando.',
      'Pelas suas respostas, a empresa aparece como o centro da questão.',
    ],
    insights: [
      { text: 'a dificuldade é percebida no negócio como um todo' },
      { text: 'equipe, sócios, caixa ou ambiente aparecem como parte do contexto' },
      { text: 'você quer olhar para a empresa além da sua relação pessoal com dinheiro' },
      { text: 'busca um acompanhamento estruturado' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Mentoria Financeira Energética — Empresa',
    productExplanation: [
      'Esse processo olha a empresa como um sistema. A partir do Diagnóstico Financeiro, os encontros são direcionados ao campo da empresa, considerando os elementos mapeados pela Bruna dentro de sua abordagem.',
    ],
    comoFunciona: [
      'Pré-requisito: Diagnóstico Financeiro',
      '10 semanas',
      '1 encontro por semana',
      'Online',
      'Diagnóstico aprofundado',
      'Plano de ação por sessão',
      'Práticas e áudios personalizados',
      'Plataforma, planner e acompanhamento no WhatsApp',
    ],
    investimento: ['Sob consulta.'],
    cuidado: 'Não há promessa de faturamento ou resultado comercial.',
    cta: 'Agendar o Diagnóstico Financeiro',
  },
  // ---------- Entrada 7 ----------
  {
    productId: 'M04',
    direcionamento: 'Você parece buscar uma nova forma de se relacionar com o próprio corpo, com tempo e acompanhamento.',
    entendendoEsseMomento: [
      'Quando a relação com o corpo é marcada por tentativas repetidas, cobranças ou frustração, pode existir o desejo de parar de tratar essa questão como mais uma meta rápida e abrir espaço para um processo mais longo de observação e cuidado.',
      'Pelas suas respostas, o que aparece não é apenas uma questão pontual, mas uma busca por acompanhamento.',
    ],
    insights: [
      { text: 'sua relação com o corpo se repete em ciclos' },
      { text: 'você quer olhar para essa questão com mais continuidade' },
      { text: 'percebe aspectos emocionais envolvidos na forma como vive o próprio corpo' },
      { text: 'está buscando um processo individual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Mentoria do Corpo Consciente',
    productExplanation: [
      'A Mentoria do Corpo Consciente é um processo individual de vinte semanas. O ponto de partida é o Diagnóstico Corporal, que orienta o trabalho. A cada semana, uma das vinte placas previstas no método é trabalhada, incluindo temas como poder pessoal, ambiente e família.',
    ],
    comoFunciona: ['Pré-requisito: Diagnóstico Corporal', '20 semanas', '1 sessão de 1 hora por semana', 'Online ou offline', '20 placas de trabalho', 'Tratamento energético e relatório em cada sessão'],
    investimento: ['Sob consulta.'],
    cuidado: 'Este trabalho é complementar. Não substitui acompanhamento médico, nutricional, psicológico ou de outros profissionais de saúde e não promete perda de peso.',
    cta: 'Agendar o Diagnóstico Corporal',
  },
  // ---------- Entrada 8 ----------
  {
    productId: 'M05',
    direcionamento: 'Você não quer apenas compreender uma relação. Quer trabalhar os padrões que continuam voltando.',
    entendendoEsseMomento: [
      'Reconhecer que certas dinâmicas se repetem pode ser um primeiro passo. Mas, quando elas atravessam amor, família, limites, vínculos ou a forma como você se posiciona, pode surgir a necessidade de um processo com continuidade.',
      'Pelas suas respostas, você parece buscar mais do que um atendimento pontual.',
    ],
    insights: [
      { text: 'você identifica padrões recorrentes em seus vínculos' },
      { text: 'quer compreender e trabalhar sua participação nessas dinâmicas' },
      { text: 'relações familiares ou amorosas ocupam espaço importante hoje' },
      { text: 'busca acompanhamento individual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Mentoria das Relações',
    productExplanation: [
      'É um acompanhamento individual de dez semanas construído a partir do Diagnóstico de Relações. Os encontros aprofundam os temas identificados no diagnóstico e trabalham as relações dentro da abordagem da Bruna.',
    ],
    comoFunciona: [
      'Pré-requisito: Diagnóstico de Relações',
      '10 semanas',
      '1 encontro individual por semana',
      'Online',
      'Plano de ação por sessão',
      'Práticas e áudios personalizados',
      'Plataforma, planner e acompanhamento no WhatsApp',
    ],
    investimento: ['Sob consulta.'],
    cuidado: 'A mentoria não é terapia nem acompanhamento psicológico.',
    cta: 'Agendar o Diagnóstico de Relações',
  },
  // ---------- Entrada 9 ----------
  {
    productId: 'M06',
    direcionamento: 'Seu momento não parece ser de começar do zero, mas de sustentar o que você já construiu.',
    entendendoEsseMomento: [
      'Depois de um processo intenso, o desafio pode deixar de ser "entender o que acontece" e passar a ser manter presença, continuidade e acompanhamento ao longo do tempo.',
      'Este resultado só deve aparecer para quem já concluiu uma mentoria ou o Caminho da Transformação.',
    ],
    insights: [
      { text: 'você já concluiu um processo com a Bruna' },
      { text: 'quer manter acompanhamento sem repetir a mesma intensidade' },
      { text: 'busca continuidade ao longo do ano' },
      { text: 'prefere ter pontos de acompanhamento distribuídos no tempo' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Sustentação da Mentoria',
    productExplanation: [
      'A Sustentação é um acompanhamento de doze meses voltado a quem já concluiu uma mentoria ou o Caminho da Transformação. O formato combina sessões online com atendimentos realizados pela Bruna à distância ao longo do ano.',
    ],
    comoFunciona: ['12 meses', '1 mapeamento inicial', '6 sessões online', '6 atendimentos offline', 'Relatório em áudio nos atendimentos offline', 'Prioridade de agenda'],
    investimento: ['Sob consulta.'],
    disponibilidade: ['Por convite para ex-clientes.'],
    cta: 'Conversar com a Bruna sobre a Sustentação',
  },
  // ---------- Entrada 10 ----------
  {
    productId: 'C01',
    direcionamento: 'Mais de uma área parece estar pedindo atenção, e você busca um processo concentrado.',
    entendendoEsseMomento: [
      'Nem sempre uma questão cabe em uma única categoria. Dinheiro, corpo, relações e vida emocional podem aparecer conectados na experiência de uma pessoa. Quando vários temas estão presentes ao mesmo tempo, pode fazer sentido começar identificando prioridades antes de definir a sequência do trabalho.',
      'Pelas suas respostas, você parece buscar um processo individual mais concentrado.',
    ],
    insights: [
      { text: 'mais de uma área apareceu com força nas suas respostas' },
      { text: 'você prefere um processo concentrado', when: disposicaoIs('intensivo') },
      { text: 'busca acompanhamento individual', when: disposicaoIs('acompanhamento') },
      { text: 'sente necessidade de organizar prioridades antes de escolher um único tema' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL DE CONTINUIDADE',
    productHeading: 'Caminho da Transformação',
    productExplanation: [
      'O Caminho da Transformação é um programa individual intensivo. Uma anamnese define a sequência do processo e, ao longo de uma a duas semanas, são realizadas de quatro a seis sessões combinando as técnicas utilizadas pela Bruna.',
      'A entrada acontece após um dos diagnósticos individuais.',
    ],
    comoFunciona: [
      'Pré-requisito: Diagnóstico Financeiro, Corporal ou de Relações',
      'Anamnese',
      '4 a 6 sessões de 1 hora',
      '1 a 2 semanas',
      'Online ou offline',
      'Ferramentas de radiestesia, radiônica e DNB dentro do método',
      'Relatórios de progresso',
    ],
    investimento: ['Sob consulta.'],
    cuidado: 'Não apresentar o processo como garantia de melhoria financeira, física ou relacional.',
    cta: 'Agendar meu diagnóstico',
  },
  // ---------- Entrada 11 ----------
  {
    productId: 'J01',
    direcionamento: 'A dívida está ocupando espaço demais, mas ela não precisa definir quem você é.',
    entendendoEsseMomento: [
      'Quando as contas se acumulam, é comum que o problema financeiro invada outras partes da vida. Vergonha, paralisia e medo podem tornar até o primeiro passo mais difícil.',
      'Pelas suas respostas, talvez o que faça mais sentido agora seja começar de forma simples e acessível, separando a situação financeira da forma como você enxerga a si mesma e criando espaço para pequenas ações de organização.',
    ],
    insights: [
      { text: 'o endividamento está pesando no seu momento atual' },
      { text: 'você sente dificuldade de saber por onde começar' },
      { text: 'busca um primeiro passo mais acessível' },
      { text: 'prefere começar com práticas curtas' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Jornada de 7 Dias',
    productExplanation: [
      'Uma jornada em grupo criada como primeiro passo para quem está vivendo o peso do endividamento. Ao longo de sete dias, a proposta é trabalhar a desidentificação da dívida e iniciar uma organização simples por meio de áudios e exercícios.',
    ],
    comoFunciona: ['7 dias', 'Online', 'Áudio curto diário', 'Exercício de identidade', 'Checklist', 'Plano simples', 'Versão ao vivo ou gravada, quando disponível'],
    investimento: ['Ao vivo: R$ 97', 'Gravada: R$ 48, quando disponível.'],
    cuidado: 'A jornada não promete quitar dívidas nem substitui planejamento ou orientação financeira profissional.',
    cta: 'Quero começar pela Jornada de 7 Dias',
  },
  // ---------- Entrada 12 ----------
  {
    productId: 'J02',
    direcionamento: 'A sensação de escassez parece ir além de um problema financeiro isolado.',
    entendendoEsseMomento: [
      'Há momentos em que a preocupação com dinheiro não aparece apenas quando falta. Ela pode continuar presente mesmo quando existe renda, influenciando decisões, impulsos, medo de receber ou a sensação de que nunca há segurança suficiente.',
      'Pelas suas respostas, você parece querer observar esses padrões com mais constância, mas ainda em um formato de entrada.',
    ],
    insights: [
      { text: 'o medo de faltar aparece com frequência' },
      { text: 'você percebe comportamentos financeiros repetitivos' },
      { text: 'busca um primeiro processo antes de um acompanhamento individual' },
      { text: 'quer construir mais consciência sobre sua relação com dinheiro' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Jornada de 21 Dias — Desprogramando a Escassez Financeira Estrutural',
    productExplanation: [
      'Durante 21 dias, a jornada propõe práticas diárias voltadas à observação dos padrões de escassez dentro da abordagem da Bruna. É um processo em grupo, com exercícios e registros simples para acompanhar o percurso.',
    ],
    comoFunciona: ['21 dias', 'Online', 'Áudio diário', 'Exercícios', 'Reprogramação mental dentro da metodologia', 'Diário/planilha', 'Versão ao vivo ou gravada, quando disponível'],
    investimento: ['Ao vivo: R$ 167', 'Gravada: R$ 97, quando disponível.'],
    cuidado: 'Não há promessa de ganho financeiro ou mudança financeira garantida.',
    cta: 'Quero conhecer a Jornada de 21 Dias',
  },
  // ---------- Entrada 13 ----------
  {
    productId: 'J03',
    direcionamento: 'Seu foco está menos no problema e mais em ampliar sua relação com prosperidade e merecimento.',
    entendendoEsseMomento: [
      'Nem todo direcionamento começa por uma crise. Algumas pessoas chegam porque querem observar desejos, escolhas e a forma como se permitem receber e construir uma relação diferente com prosperidade.',
      'Pelas suas respostas, esse parece ser o seu ponto de interesse agora.',
    ],
    insights: [
      { text: 'você quer trabalhar prosperidade e merecimento' },
      { text: 'busca clareza sobre desejos e próximos movimentos' },
      { text: 'prefere começar por uma experiência em grupo' },
      { text: 'tem abertura para práticas de visualização, escrita e reflexão' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Jornada de 21 Dias — Riqueza e Manifestação',
    productExplanation: [
      'Uma jornada em grupo com práticas diárias voltadas à mentalidade de prosperidade, clareza de desejos e merecimento dentro da linguagem e abordagem da Bruna.',
    ],
    comoFunciona: ['21 dias', 'Online', 'Áudios diários', 'Afirmações', 'Visualização', 'Escrita', 'Checklist e diário', 'Versão ao vivo ou gravada, quando disponível'],
    investimento: ['Ao vivo: R$ 167', 'Gravada: R$ 97, quando disponível.'],
    cuidado: '"Manifestação" e "riqueza" fazem parte da abordagem do programa e não representam promessa de resultado financeiro.',
    cta: 'Quero conhecer essa jornada',
  },
  // ---------- Entrada 14 ----------
  {
    productId: 'J04',
    direcionamento: 'Você sente necessidade de marcar um encerramento e criar espaço para um recomeço.',
    entendendoEsseMomento: [
      'Quando perdas, peso emocional ou situações repetitivas se acumulam, algumas pessoas sentem necessidade de um ritual de passagem: um período dedicado a observar o que desejam encerrar e o que querem levar adiante.',
      'Pelas suas respostas e pela sua abertura para uma abordagem espiritual, uma experiência guiada e coletiva pode fazer sentido como primeiro passo.',
    ],
    insights: [
      { text: 'você percebe ciclos que parecem se repetir' },
      { text: 'sente necessidade de recomeço' },
      { text: 'busca uma experiência espiritual estruturada' },
      { text: 'prefere práticas diárias acompanhadas' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: '40 Dias — Exorcismo',
    productExplanation: [
      'Apesar do nome intenso, trata-se de uma jornada de limpeza energética dentro da metodologia da Bruna. Durante quarenta dias, a pessoa acompanha práticas, áudios, orações e decretos propostos para o processo.',
    ],
    comoFunciona: ['40 dias', 'Online', 'Ritual diário', 'Áudios guiados', 'Orações e decretos', 'Checklist', 'Grupo de acompanhamento', 'Versão ao vivo ou gravada, quando disponível'],
    investimento: ['Ao vivo: R$ 44', 'Gravada: R$ 26, quando disponível.'],
    cuidado: 'A linguagem de limpeza energética pertence à abordagem espiritual do programa. Este trabalho não substitui acompanhamento profissional de saúde ou saúde mental.',
    cta: 'Quero conhecer a jornada de 40 dias',
  },
  // ---------- Entrada 15 ----------
  {
    productId: 'J05',
    direcionamento: 'Você quer cuidar do seu momento sem escolher uma única área da vida.',
    entendendoEsseMomento: [
      'Às vezes não existe um único tema dominante. Saúde, relações, finanças e espiritualidade podem estar todas presentes, e a pessoa prefere começar por uma experiência coletiva, pontual e acessível.',
      'Pelas suas respostas, esse formato parece combinar com o que você busca agora.',
    ],
    insights: [
      { text: 'mais de uma área está chamando sua atenção' },
      { text: 'você prefere começar por uma experiência coletiva' },
      { text: 'busca um formato pontual' },
      { text: 'tem abertura para a abordagem energética da Bruna' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Portal do Mês — 4 Prosperidades',
    productExplanation: [
      'Uma vez por mês, na data do portal, a Bruna conduz um atendimento coletivo ao vivo com a Mesa das 4 Prosperidades, olhando dentro do método para saúde, relacionamentos, finanças e espiritualidade.',
    ],
    comoFunciona: ['1 noite', 'Online e ao vivo', 'Atendimento coletivo', 'Mesa Radiônica das 4 Prosperidades', 'Leitura coletiva', 'Áudio de integração', 'Replay para participantes'],
    investimento: ['R$ 44'],
    disponibilidade: ['Acontece por calendário. Não é comercializado como produto gravado depois da data.'],
    cuidado: '"Portal", "ativação" e outros termos espirituais pertencem à linguagem do método.',
    cta: 'Ver a próxima data do Portal',
  },
  // ---------- Entrada 16 ----------
  {
    productId: 'J06',
    direcionamento: 'A ansiedade está interferindo na forma como você vive e toma decisões.',
    entendendoEsseMomento: [
      'A ansiedade pode aparecer de muitas formas e merece cuidado. Pelas suas respostas, ela está ocupando espaço suficiente para ser reconhecida como um tema importante neste momento.',
      'Aqui, o objetivo do direcionamento não é explicar a causa da ansiedade nem tratá-la clinicamente. É apenas indicar, entre os produtos da Bruna, qual conteúdo foi criado especificamente em torno desse tema.',
    ],
    insights: [
      { text: 'você percebe ansiedade ou estado de alerta no cotidiano' },
      { text: 'isso interfere em decisões, dinheiro ou relações' },
      { text: 'prefere começar por práticas em grupo' },
      { text: 'busca um primeiro passo complementar' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Jornada — Desprogramando a Ansiedade',
    productExplanation: [
      'Uma jornada em grupo com áudios e práticas diárias dentro da abordagem da Bruna, criada para trabalhar o tema da ansiedade de forma complementar.',
    ],
    comoFunciona: ['Online', 'Áudios e práticas diárias', 'Checklist', 'Duração final ainda precisa ser confirmada pela Bruna', 'A versão gravada está em preparação'],
    investimento: ['Ao vivo: R$ 167', 'A versão gravada terá valor correspondente a 50% da edição ao vivo quando estiver disponível.'],
    cuidado: 'Ansiedade é um tema de saúde mental. Esta jornada não é tratamento para transtornos de ansiedade e não substitui acompanhamento psicológico, psiquiátrico ou outro cuidado profissional.',
    cta: 'Entrar na lista da próxima versão disponível',
  },
  // ---------- Entrada 17 ----------
  {
    productId: 'T01',
    direcionamento: 'Existe um vínculo que você sente que precisa encerrar de outra forma.',
    entendendoEsseMomento: [
      'Alguns ciclos terminam na prática, mas continuam ocupando espaço emocional ou simbólico. Isso pode acontecer com uma relação, um trabalho, uma situação ou outra experiência da qual a pessoa sente dificuldade de se desvincular.',
      'Pelas suas respostas, você não parece buscar necessariamente um processo longo agora, mas um atendimento voltado especificamente a esse encerramento.',
    ],
    insights: [
      { text: 'existe uma relação ou situação que já terminou, mas ainda ocupa espaço' },
      { text: 'você sente dificuldade de se desvincular' },
      { text: 'prefere trabalhar um tema específico' },
      { text: 'tem abertura para um atendimento energético' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa do Divórcio Energético',
    productExplanation: [
      'Dentro da abordagem da Bruna, essa mesa é voltada ao trabalho simbólico e energético de vínculos com pessoas, situações, trabalhos ou padrões que a pessoa deseja encerrar.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'A Bruna realiza o atendimento sem sua presença', 'Relatório em áudio ao final', 'Aplicada por tema'],
    investimento: ['R$ 530'],
    cuidado: 'O conceito de vínculo energético pertence ao método da Bruna. Não há promessa de resultado e o atendimento não substitui cuidados psicológicos quando necessários.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 18 ----------
  {
    productId: 'T02',
    direcionamento: 'O que está pedindo atenção para você é o ambiente.',
    entendendoEsseMomento: [
      'Há momentos em que a pessoa não identifica a questão apenas em si, mas na relação que tem com um espaço: uma casa nova, um imóvel associado a uma fase difícil ou um ambiente de trabalho que parece pesado.',
      'Pelas suas respostas e pela sua abertura para a abordagem energética, o foco do atendimento pode ser o próprio ambiente.',
    ],
    insights: [
      { text: 'sua questão está ligada a uma casa, empresa ou imóvel' },
      { text: 'você percebe o ambiente como pesado ou pouco fluido' },
      { text: 'passou recentemente por mudança ou transição no espaço' },
      { text: 'busca um atendimento pontual para o local' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa de Limpeza de Casas e Empresas',
    productExplanation: [
      'É um atendimento de harmonização energética do ambiente realizado à distância. Dentro do método, a Bruna trabalha a partir do endereço do imóvel.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', 'Para casa ou empresa', '1 sessão', '1 hora', 'Offline', 'Realizada à distância', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: 'A harmonização energética pertence à abordagem espiritual da Bruna. Não há promessa de venda, aluguel, valorização ou resultado comercial relacionado ao imóvel.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 19 ----------
  {
    productId: 'T03',
    direcionamento: 'Mais de uma área da sua vida parece pedir atenção ao mesmo tempo.',
    entendendoEsseMomento: [
      'Nem sempre dinheiro, relações, saúde e espiritualidade são percebidos como assuntos separados. Algumas pessoas chegam sentindo um desequilíbrio mais amplo e preferem começar por uma leitura que considere essas quatro áreas.',
      'Pelas suas respostas, um atendimento individual e pontual com esse olhar mais abrangente pode fazer sentido.',
    ],
    insights: [
      { text: 'mais de uma área apareceu no seu direcionamento' },
      { text: 'você busca um atendimento individual' },
      { text: 'prefere trabalhar uma questão pontual antes de iniciar um processo longo' },
      { text: 'tem abertura para a abordagem energética' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa das 4 Prosperidades',
    productExplanation: [
      'A mesa trabalha, dentro da metodologia da Bruna, quatro áreas: saúde, relacionamentos, finanças e espiritualidade. Pode ser realizada como uma sessão única ou em um ciclo de quatro sessões, uma dedicada a cada tema.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', 'Offline', '1 sessão de 1 hora ou ciclo de 4 sessões', 'A Bruna realiza o atendimento sem sua presença', 'Relatório em áudio após cada sessão'],
    investimento: ['1 sessão: R$ 530', 'Ciclo de 4 sessões: R$ 1.700'],
    cuidado: '"Prosperidade" e demais conceitos energéticos pertencem à linguagem do método. Não representam promessa de resultado financeiro, de saúde ou de relacionamento.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 20 ----------
  {
    productId: 'T04',
    direcionamento: 'Você sente que está encerrando uma fase e precisa abrir espaço para a próxima.',
    entendendoEsseMomento: [
      'Algumas transições não chegam com uma pergunta muito objetiva. A pessoa apenas percebe que uma fase perdeu sentido, que existe peso acumulado ou que precisa marcar internamente uma mudança.',
      'Pelas suas respostas e pela sua abertura para uma abordagem espiritual, um atendimento pontual voltado a essa transição pode fazer sentido.',
    ],
    insights: [
      { text: 'você sente necessidade de encerrar um ciclo' },
      { text: 'percebe um peso difícil de traduzir em uma única área' },
      { text: 'busca um atendimento espiritual mais profundo' },
      { text: 'prefere uma sessão pontual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa da Cura Ascensional',
    productExplanation: [
      'Dentro da metodologia da Bruna, é uma mesa voltada ao trabalho energético de encerramento de fases, chakras, ancestralidade, prisões emocionais e ancoramento a partir do coração.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'A Bruna realiza o atendimento sem sua presença', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: '"Cura" é o nome utilizado dentro da abordagem energética e simbólica do método. Não significa cura de doença nem substitui acompanhamento profissional de saúde.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 21 ----------
  {
    productId: 'T05',
    direcionamento: 'Um padrão emocional parece continuar voltando, mesmo quando você tenta agir diferente.',
    entendendoEsseMomento: [
      'Perceber um comportamento repetitivo pode ser frustrante, principalmente quando racionalmente você já sabe que gostaria de fazer diferente. Isso não significa que exista uma única causa escondida ou uma explicação pronta para o que acontece.',
      'Pelas suas respostas, você parece buscar um atendimento pontual dentro da abordagem da Bruna para olhar esses padrões.',
    ],
    insights: [
      { text: 'você identifica comportamentos ou emoções que se repetem' },
      { text: 'sente dificuldade de mudar esse padrão apenas pela decisão racional' },
      { text: 'busca um atendimento específico, e não um processo longo' },
      { text: 'tem abertura para a abordagem energética e DNB' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa DNB — Desprogramação Neurobiológica',
    productExplanation: [
      'É uma mesa que reúne, dentro do método da Bruna, radiestesia, radiônica e Desprogramação Neurobiológica para trabalhar padrões percebidos em diferentes áreas da vida.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'A Bruna realiza o atendimento sem sua presença', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: 'DNB, campo e energia são termos da metodologia da Bruna e não devem ser apresentados como fatos científicos ou tratamento de saúde.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 22 ----------
  {
    productId: 'T06',
    direcionamento: 'Você percebe padrões que parecem atravessar histórias e gerações da sua família.',
    entendendoEsseMomento: [
      'Às vezes uma pessoa reconhece comportamentos, medos ou dinâmicas semelhantes em diferentes gerações da família. Isso pode despertar curiosidade sobre o que ela aprendeu, repetiu ou incorporou ao longo da própria história.',
      'Pelas suas respostas e pela sua abertura para a abordagem sistêmica e energética da Bruna, esse parece ser o tema mais próximo do que você busca.',
    ],
    insights: [
      { text: 'você percebe padrões semelhantes em diferentes gerações' },
      { text: 'sente que determinadas histórias familiares ainda influenciam suas escolhas' },
      { text: 'quer olhar para ancestralidade dentro da abordagem da Bruna' },
      { text: 'prefere um atendimento pontual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa DNB — DNA Sistêmica',
    productExplanation: [
      'Dentro da metodologia da Bruna, essa mesa trabalha fases da vida, ancestralidade e padrões transgeracionais, utilizando a linguagem da DNB e da abordagem energética.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'Aplicada por fase de vida', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: '"Epigenética", "transgeracional" e outros conceitos usados aqui pertencem à linguagem do método e não devem ser apresentados como comprovação científica de causa.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 23 ----------
  {
    productId: 'T07',
    direcionamento: 'A questão que trouxe você até aqui envolve o vínculo com o seu pet.',
    entendendoEsseMomento: [
      'Quem convive de perto com um animal percebe o quanto essa relação faz parte da rotina e da vida emocional da casa. Quando algo chama atenção no pet, é natural querer olhar para a situação por diferentes perspectivas.',
      'Pelas suas respostas, você tem interesse em uma abordagem energética que considere o vínculo entre pet e tutor.',
    ],
    insights: [
      { text: 'sua principal preocupação neste momento envolve seu pet' },
      { text: 'você percebe uma situação ou comportamento que se repete' },
      { text: 'quer incluir também o vínculo com o tutor na abordagem' },
      { text: 'busca um atendimento pontual e à distância' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa DNB para Pets e Tutores',
    productExplanation: [
      'Dentro do método da Bruna, essa mesa olha pet e tutor como partes de um mesmo sistema energético e trabalha simbolicamente esse vínculo.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'Realizada à distância', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: 'Este atendimento não é tratamento veterinário e não substitui avaliação, diagnóstico ou acompanhamento de um médico-veterinário.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 24 ----------
  {
    productId: 'T08',
    direcionamento: 'Você busca uma abordagem espiritual mais profunda para algo que ainda não conseguiu nomear completamente.',
    entendendoEsseMomento: [
      'Nem toda busca começa com uma questão clara. Algumas pessoas chegam depois de já terem olhado para o mesmo tema por outros caminhos e continuam sentindo que gostariam de explorá-lo também pela dimensão espiritual.',
      'Pelas suas respostas, é essa abertura para um atendimento energético mais profundo que aparece com mais força.',
    ],
    insights: [
      { text: 'você sente que existe algo que ainda não conseguiu compreender' },
      { text: 'já buscou outras formas de olhar para essa questão' },
      { text: 'deseja uma abordagem espiritual' },
      { text: 'prefere um atendimento pontual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa da Cirurgia Espiritual',
    productExplanation: [
      'Apesar do nome, não se trata de procedimento médico. É um atendimento energético realizado dentro da abordagem espiritual da Bruna para quem deseja uma leitura mais profunda desse campo.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'Realizada à distância', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: '"Cirurgia" é uma denominação espiritual do método. Não é procedimento de saúde e não substitui avaliação ou acompanhamento médico, psicológico ou de outros profissionais.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 25 ----------
  {
    productId: 'T09',
    direcionamento: 'O luto está pedindo atenção neste momento.',
    entendendoEsseMomento: [
      'O luto não tem um único jeito de acontecer. Uma perda pode deixar lembranças, vínculos, sentimentos e questões que continuam ocupando espaço enquanto a vida tenta encontrar uma nova forma de seguir.',
      'Pelas suas respostas, a experiência de perda aparece como um dos temas que mais pedem atenção agora. Isso não significa que exista uma forma certa ou errada de viver o luto. O direcionamento apenas reconhece que talvez seja importante reservar um espaço para olhar para essa experiência com cuidado.',
    ],
    insights: [
      { text: 'você está atravessando ou ainda sente os efeitos de uma perda' },
      { text: 'esse assunto continua ocupando espaço na sua vida' },
      { text: 'sente necessidade de olhar especificamente para esse momento' },
      { text: 'prefere um atendimento pontual em vez de iniciar agora um processo longo' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL PARA O SEU MOMENTO',
    productHeading: 'Mesa do Luto, Morte e Encaminhamento',
    productExplanation: [
      'Dentro da abordagem energética da Bruna, esse atendimento é voltado especificamente aos momentos de perda. A proposta é trabalhar simbolicamente e energeticamente questões relacionadas ao luto e ao processo de encerramento.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'A Bruna realiza o atendimento sem a sua presença', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: 'Este é um trabalho energético e complementar. Não substitui acompanhamento psicológico, médico ou outros cuidados profissionais quando necessários.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 26 ----------
  {
    productId: 'T10',
    direcionamento: 'Você sente que se protegeu por tanto tempo que agora também ficou difícil deixar o novo entrar.',
    entendendoEsseMomento: [
      'Proteção pode ser necessária em determinadas fases. Mas algumas pessoas percebem que, depois de um tempo, aquilo que ajudou a criar distância da dor também pode dificultar abertura, confiança ou disponibilidade para novas experiências.',
      'Pelas suas respostas, esse tema de proteção e abertura aparece como uma boa tradução do que você quer trabalhar agora.',
    ],
    insights: [
      { text: 'você sente dificuldade de se abrir para algo novo' },
      { text: 'percebe que criou formas de proteção emocional' },
      { text: 'quer trabalhar uma questão específica' },
      { text: 'tem abertura para uma abordagem espiritual' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Mesa do Milagre',
    productExplanation: [
      '"Milagre" é o nome da mesa utilizada pela Bruna. Dentro da metodologia, o trabalho é voltado ao que ela descreve como a "armadura do coração": proteções construídas ao longo da experiência e que a pessoa deseja olhar de outra forma.',
    ],
    comoFunciona: ['Sem diagnóstico prévio', '1 sessão', '1 hora', 'Offline', 'A Bruna realiza o atendimento sem sua presença', 'Relatório em áudio ao final'],
    investimento: ['R$ 530'],
    cuidado: 'O nome "Mesa do Milagre" não representa promessa de milagre, transformação extraordinária ou resultado garantido.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 27 ----------
  {
    productId: 'T11',
    direcionamento: 'Você quer olhar para o corpo por uma perspectiva energética e pontual.',
    entendendoEsseMomento: [
      'Às vezes a pessoa não busca um processo longo sobre a relação com o corpo. Ela quer um atendimento específico, dentro de uma abordagem energética, para observar o que esse método propõe como sinais e mensagens do corpo.',
      'Pelas suas respostas, esse formato pontual parece mais próximo do que você procura agora.',
    ],
    insights: [
      { text: 'o corpo aparece como tema importante no seu momento' },
      { text: 'você busca uma leitura pontual, e não uma mentoria' },
      { text: 'tem abertura para uma abordagem energética' },
      { text: 'quer receber uma devolutiva em áudio sobre o atendimento' },
    ],
    caminhoLabel: 'UM CAMINHO POSSÍVEL',
    productHeading: 'Leitura Energética dos Órgãos',
    productExplanation: [
      'É uma leitura realizada à distância dentro da metodologia energética da Bruna. A proposta é observar os órgãos pela perspectiva simbólica e energética do método e enviar uma devolutiva sobre o que foi trabalhado.',
      'Ela é diferente do Diagnóstico Corporal: a leitura é um atendimento pontual; o Diagnóstico Corporal é a porta de entrada para a Mentoria do Corpo Consciente.',
    ],
    comoFunciona: ['1 sessão', 'Offline', 'Não exige sua presença', 'Relatório completo em áudio', 'O catálogo recomenda intervalo de 3 a 6 meses entre leituras'],
    investimento: ['R$ 530'],
    cuidado: 'Esta é uma leitura energética e simbólica. Não diagnostica doenças, não substitui exames e não substitui acompanhamento médico ou de outros profissionais de saúde.',
    cta: 'Quero conversar com a Bruna',
  },
  // ---------- Entrada 28 ----------
  {
    productId: 'E01',
    direcionamento: 'Você quer começar a entender sua relação com a escassez, mas ainda está explorando o tema.',
    entendendoEsseMomento: [
      'Nem todo mundo precisa começar por uma sessão ou processo. Às vezes o primeiro passo é simplesmente encontrar palavras para algo que já vinha sendo sentido: a impressão de que a escassez continua presente mesmo quando a realidade financeira muda.',
      'Pelas suas respostas, começar por conteúdo e reflexão pode fazer mais sentido neste momento.',
    ],
    insights: [
      { text: 'você ainda está conhecendo o trabalho da Bruna' },
      { text: 'quer entender melhor o tema antes de escolher um atendimento' },
      { text: 'prefere começar por um formato simples' },
      { text: 'a escassez financeira apareceu como um assunto relevante' },
    ],
    caminhoLabel: 'UM PRIMEIRO PASSO POSSÍVEL',
    productHeading: 'Ebook Escassez Invisível',
    productExplanation: [
      'O ebook apresenta a visão da Bruna sobre a "escassez que ninguém vê": padrões que, dentro da abordagem dela, podem continuar aparecendo mesmo quando existe entrada de dinheiro.',
      'É uma forma simples de conhecer melhor essa perspectiva antes de decidir se quer seguir para uma jornada ou para o Diagnóstico Financeiro.',
    ],
    comoFunciona: ['Ebook em PDF', 'Download digital', 'Leitura no seu ritmo'],
    investimento: ['Ainda não definido pela Bruna.', 'Não exibir valor até confirmação.'],
    cta: 'Conhecer o Ebook Escassez Invisível',
  },
];

export function getResultContent(productId: string): ResultContent | undefined {
  return resultContent.find((r) => r.productId === productId);
}

/** Insights compatíveis com as respostas reais, já cortados em 2–4 (regra da matriz). */
export function getInsightsFor(productId: string, answers: QuizAnswers): string[] {
  const content = getResultContent(productId);
  if (!content) return [];
  return content.insights
    .filter((i) => !i.when || i.when(answers))
    .slice(0, 4)
    .map((i) => i.text);
}
