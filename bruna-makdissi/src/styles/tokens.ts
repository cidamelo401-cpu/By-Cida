/**
 * Tokens de design — Bruna Makdissi, sistema "Alvorada v1.0".
 *
 * Transcrição literal de `references/design-system.md` da skill
 * `bruna-makdissi-design` (não trabalhar de memória — a skill é explícita
 * sobre isso, a marca já mudou de fonte uma vez). Fonte única de verdade:
 * qualquer componente ou config do Tailwind deve importar daqui, nunca
 * declarar hex solto.
 *
 * Regras de uso que não são só estética (violá-las é bug de marca, não gosto):
 * - Ouro é emblema/registro. Horizonte é ação. Os dois nunca disputam o
 *   mesmo elemento — ouro NUNCA preenche botão.
 * - No máximo um bloco `noite.900` por tela inteira (não por seção).
 * - Nunca cor por categoria/pilar em resultado — usar nível nomeado.
 * - Sombra sempre tingida de noite (rgba(35,27,56,…)), nunca preto neutro.
 */

export const color = {
  // Noite — índigo-ameixa. Texto, filete, o bloco escuro (1x por peça).
  noite: {
    900: '#231B38',
    800: '#2F2549',
    700: '#3D3160',
    600: '#4E3F78',
    500: '#63538F',
    400: '#8579A8',
    300: '#ADA3C4',
    200: '#D0CADE',
    100: '#E9E5F0',
    50: '#F4F1F8',
  },
  // Névoa — a página. Base quente rosada de quase toda superfície.
  nevoa: {
    0: '#FFFFFF',
    100: '#FDFAF8',
    200: '#F9F2F1',
    300: '#EFE4E2',
    400: '#DFCFCC',
  },
  // Horizonte — ação. Botão primário, link, item ativo, progresso, foco.
  horizonte: {
    700: '#9A4632',
    600: '#B4553F',
    500: '#CE6B4A',
    400: '#E08B63',
    300: '#EFB18C',
    200: '#F7D6C2',
    100: '#FCEDE4',
  },
  // Ouro — emblema e registro. Nunca botão, nunca bloco grande, nunca metálico.
  ouro: {
    700: '#7E5A1E',
    600: '#A57B33',
    500: '#C89A4E',
    300: '#E4C48D',
    100: '#F7EDD8',
  },
  // Tinta — texto sobre névoa.
  tinta: {
    900: '#231B38',
    700: '#403353',
    500: '#6B5F7F',
    400: '#94899F',
    300: '#B7AEC0',
  },
  // Escala sequencial — magnitude em matiz única. Para barra/gráfico. NUNCA categórica.
  sequencial: ['#FBE9DE', '#F6D2BC', '#EFB18C', '#E08B63', '#CE6B4A', '#B4553F', '#8E3F2C'] as const,
} as const;

/**
 * Estados semânticos — reservados a feedback de sistema (salvou, falhou, pede
 * atenção). NUNCA reaproveitar como série de dado ou cor de pilar/resultado.
 */
export const semantic = {
  sucesso: { fg: '#4C8267', bg: '#E7F0EA' },
  erro: { fg: '#A63A31', bg: '#F9E9E7' },
  atencao: { fg: '#B4553F', bg: '#FCEDE4' },
  registro: { fg: '#A57B33', bg: '#F7EDD8' },
  informacao: { fg: '#4E3F78', bg: '#EDEAF4' },
} as const;

/** Aliases semânticos — componentes consomem estes, nunca os valores brutos acima. */
export const alias = {
  surfaceCover: color.noite[900],
  surfacePage: color.nevoa[200],
  surfaceWork: color.nevoa[0],
  surfaceSunken: color.nevoa[100],
  lineRule: 'rgba(35,27,56,.065)',
  lineHair: 'rgba(35,27,56,.11)',
  lineStrong: 'rgba(35,27,56,.22)',
  action: color.horizonte[500],
  actionHover: color.horizonte[600],
  emblem: color.ouro[500],
  focusRing: '0 0 0 3px rgba(206,107,74,.42)',
} as const;

export const font = {
  display: "'Newsreader', serif", // capa, título de página, número, citação
  body: "'Inter', sans-serif", // corpo e interface
} as const;

export const type = {
  cover: { font: font.display, weight: 300, size: '42px' },
  pageTitle: { font: font.display, weight: 400, size: '30px' },
  reflectiveQuote: { font: font.display, style: 'italic', size: '20px' },
  data: { font: font.display, feature: 'tabular-nums' as const },
  body: { font: font.body, weight: 300, size: '14px' },
  marginLabel: { font: font.body, weight: 500, size: '9.5px', letterSpacing: '.19em', transform: 'uppercase' as const },
  /** Peso 200 é usado SÓ na tagline do lockup — fino demais para texto de interface. */
  lockupTagline: { font: font.body, weight: 200 },
} as const;

export const radius = {
  // Marca (chip, badge, botão de peça de comunicação).
  pill: '999px',
  // Produto e interface.
  button: '6px',
  field: '10px',
  card: '16px',
} as const;

/** Sombra sempre tingida de noite — nunca preto neutro. */
export const shadow = {
  sm: '0 1px 2px rgba(35,27,56,.06)',
  md: '0 3px 14px rgba(35,27,56,.07)',
  lg: '0 16px 44px rgba(35,27,56,.13)',
  cover: '0 24px 64px rgba(35,27,56,.3)',
} as const;

/** Calmo, sem bounce, sem escala no clique. Respeitar sempre prefers-reduced-motion. */
export const motion = {
  easing: 'cubic-bezier(.22,.61,.36,1)',
  durationMs: { min: 140, max: 200 },
} as const;

export const space = [4, 8, 12, 16, 24, 32, 48, 72, 104] as const;

export const layout = {
  paragraphWidth: '680px',
  gridWidth: '1160px',
  ruleLineHeight: '26px',
} as const;

export const brand = {
  tagline: 'Consciência que transforma',
  quote: 'Eu não te ensino a sair da escassez porque estudei sobre ela. Eu te ensino porque saí dela.',
} as const;
