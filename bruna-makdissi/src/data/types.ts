/**
 * Tipos centrais da camada de conteúdo (catálogo, quiz, recomendação, WhatsApp).
 *
 * Fonte oficial dos dados: "Catálogo de Produtos — Bruna Makdissi v1.0" (23/09/2026),
 * aprovado pela Bruna e pelo Jean. Nada aqui foi inventado: campos sem informação no
 * catálogo aparecem como `null` ou array vazio, nunca preenchidos com suposição.
 */

export type ProductCategory =
  | 'diagnostico'
  | 'mentoria'
  | 'intensivo'
  | 'sustentacao'
  | 'mesa'
  | 'jornada'
  | 'evento_coletivo'
  | 'digital';

export type PricingMode = 'publico' | 'sob_consulta' | 'a_definir';

export interface PriceInfo {
  mode: PricingMode;
  /** Preço único, ou preço da versão "ao vivo" quando existir também versão gravada. */
  valor?: number;
  /** Preço da versão gravada, quando existir. */
  valorGravado?: number;
  /** Pacote alternativo de múltiplas sessões (ex.: 4 Prosperidades). */
  pacote?: { sessoes: number; valor: number };
  /** false quando o produto nunca tem versão gravada (ex.: Portal do Mês). */
  temVersaoGravada: boolean;
  /** Nota livre — ex. "Ebook em finalização", "Parcelado em 12x fixo". */
  observacao?: string;
}

export interface Product {
  id: string;
  nome: string;
  categoria: ProductCategory;
  temaPrincipal: string[];
  paraQueServe: string;
  comoFunciona: string;
  duracaoRitmo: string;
  oQueRecebe: string;
  /** Texto livre do catálogo. null = "Nenhum". */
  preRequisito: string | null;
  /** Texto livre do catálogo (não normalizado em IDs — ver recommendationRules.ts para a lógica). */
  proximoPassoNatural: string;
  paraQuemE: string;
  paraQuemNaoE: string;
  /** Nomes de personas (ver personas.ts). */
  personas: string[];
  doresPrincipais: string[];
  desejos: string[];
  objecoesComuns: string[];
  nivelConsciencia: string;
  momentoNaEsteira: string;
  preco: PriceInfo;
  formaPagamento: string;
  disponibilidade: string;
  cta: string;
  /** Texto livre do catálogo sobre indicação automática pelo questionário. */
  indicacaoAutomatica: string;
  /**
   * Instrução INTERNA para quem escreve a copy deste produto (ex.: "nunca
   * prometer X", "não copiar o site Y") — vem do catálogo tal como a Bruna
   * escreveu para a equipe. NUNCA renderizar este campo direto para o
   * visitante; um disclaimer público de verdade é texto curado à parte,
   * escrito seguindo esta instrução (ver o componente Disclaimer da landing
   * como exemplo do padrão certo).
   */
  cuidadosLinguagem: string | null;
}

export interface Persona {
  id: string;
  nome: string;
  doresRegistradas: string[];
  desejosRegistrados: string[];
  produtosOndeAparece: string[];
  objecoesTipicas: string[];
  canais: string[];
}

// ---------- Quiz ----------

export type TemaId =
  | 'dinheiro'
  | 'corpo'
  | 'relacoes'
  | 'casa_empresa'
  | 'pet'
  | 'ansiedade'
  | 'espiritual';

export type MomentoId = 'comecando' | 'repete_tempo' | 'pesado';

export type HistoricoId = 'nenhum' | 'grupo_mesa' | 'diagnostico' | 'mentoria_caminho';

export type DisposicaoId = 'acessivel' | 'pontual' | 'acompanhamento';

export interface QuizAnswers {
  tema: TemaId;
  momento: MomentoId;
  historico: HistoricoId;
  disposicao: DisposicaoId;
}

export interface QuizOption<T extends string> {
  id: T;
  label: string;
  emoji?: string;
}

export interface QuizQuestion<T extends string> {
  id: keyof QuizAnswers;
  pergunta: string;
  opcoes: QuizOption<T>[];
}

// ---------- Motor de recomendação ----------

export interface RecommendationResult {
  /** Produto(s) principal(is). Normalmente 1 — pode ser mais de 1 só no caso espiritual+pontual. */
  primaryProductIds: string[];
  /** Produto(s) de próximo passo, quando houver. */
  nextStepProductIds: string[];
  /** true quando a recomendação não pôde ser uma única resposta (ex.: várias mesas espirituais). */
  requiresWhatsappToChoose: boolean;
  /** true quando o resultado é difuso e não deve forçar um produto específico. */
  isDiffuse: boolean;
  /** true quando deve exibir a nota de apoio profissional (ex.: ansiedade). */
  professionalSupportNotice: boolean;
  /** Texto curto explicando o "e depois" — sempre a partir do catálogo, nunca inventado. */
  nextStepNote?: string;
  /** Identificador da regra aplicada (para depuração/analytics — ver recommendationRules.ts). */
  ruleId: string;
}
