// Despeja! — interpretação do despejo.
//
// >>> PONTO DE TROCA PARA A IA REAL <<<
// `interpretar(texto)` e `sugerirPassos(titulo)` são as ÚNICAS funções que o resto do app usa
// para "entender" texto. Hoje elas são simuladas aqui, por regras locais. Na fase final basta
// reescrever as duas para chamar a IA e devolver o mesmo formato:
//   interpretar -> [{ titulo, tipo: 'tarefa'|'ideia'|'lembrete', projeto: id|null, grande: boolean }]
//   sugerirPassos -> [string, string, ...]

const MAPA = { á:'a', à:'a', â:'a', ã:'a', ä:'a', é:'e', ê:'e', è:'e', ë:'e', í:'i', ì:'i', î:'i', ï:'i',
  ó:'o', ò:'o', ô:'o', õ:'o', ö:'o', ú:'u', ù:'u', û:'u', ü:'u', ç:'c', ñ:'n' };
// minúsculas e sem acento, MESMO tamanho do original (permite achar posições e cortar o texto original)
export const dobrar = (s) => s.toLowerCase().replace(/[À-ſ]/g, (c) => MAPA[c] || c);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 1. Separar o despejo em pedaços ---------- */

const INICIOS = '(?:preciso|precisamos|tenho (?:que|de)|tenho uma ideia|tive (?:uma|a) ideia|tive ideia|ideia|lembrar|lembrete|nao esquecer|nao posso esquecer|quero|queria|vou|devo|falar|ligar|comprar|marcar|agendar|enviar|mandar|pagar|responder|organizar|fazer|resolver|buscar|pegar|levar|renovar|cancelar|contratar|revisar|criar|pensar|ver|pedir|conversar|combinar|reservar|entregar|finalizar|terminar|estudar|escrever|postar|publicar|visitar|e se|seria legal|podia|poderia)';
const CONECTOR = new RegExp(`(?:,\\s*(?:e\\s+)?|\\s+e\\s+(?:tambem\\s+)?|\\s+tambem\\s+|\\s+alem disso\\s+|\\s+depois\\s+)(?=${INICIOS}\\b)`, 'g');

function separar(texto) {
  const pedacos = [];
  // 1º frases (. ! ? ; e quebras de linha)
  const frases = texto.split(/[.!?;]+\s*|\n+/);
  for (const frase of frases) {
    if (!frase.trim()) continue;
    // 2º dentro da frase, só corta onde vem um novo "começo de intenção" (evita quebrar "pão e leite")
    const dobrado = dobrar(frase);
    let inicio = 0;
    for (const m of dobrado.matchAll(CONECTOR)) {
      pedacos.push(frase.slice(inicio, m.index));
      inicio = m.index + m[0].length;
    }
    pedacos.push(frase.slice(inicio));
  }
  return pedacos.map((p) => p.trim()).filter(Boolean);
}

/* ---------- 2. Entender cada pedaço ---------- */

const RE_IDEIA = /^(?:tenho uma ideia|tive (?:uma |a )?ideia|ideia)\s*(?:de|para|pra|:|-)?\s*/;
const RE_IDEIA_SOLTA = /^(?:e se|seria legal|podia|poderia)\b/;
const RE_LEMBRETE = /^(?:(?:preciso|tenho que|tenho de|devo)\s+)?(?:me\s+)?(?:lembrar|lembrete)\s*(?:de|que|:)?\s*|^(?:nao esquecer|nao posso esquecer|nao me deixe esquecer)\s*(?:de)?\s*/;
const RE_TAREFA = /^(?:preciso|precisamos|tenho que|tenho de|devo|quero|queria|vou)\s+/;
const RE_HORA = /\b\d{1,2}\s?h(?:\d{2})?\b|\b\d{1,2}:\d{2}\b/;

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function entender(pedaco) {
  let t = pedaco.replace(/^(?:e(?!\s+se\b)|tambem|ai|entao|depois|mas)\s+/i, '').trim();
  let f = dobrar(t);
  let tipo = 'tarefa';
  let corte = 0;

  let m;
  if ((m = f.match(RE_IDEIA))) { tipo = 'ideia'; corte = m[0].length; }
  else if (RE_IDEIA_SOLTA.test(f)) { tipo = 'ideia'; }
  else if ((m = f.match(RE_LEMBRETE))) { tipo = 'lembrete'; corte = m[0].length; }
  else if ((m = f.match(RE_TAREFA))) {
    corte = m[0].length;
    if (/^de\s/.test(f.slice(corte))) { t = t.slice(0, corte) + 'Providenciar ' + t.slice(corte + 3); f = dobrar(t); }
  }
  else if (/\bideia\b/.test(f)) tipo = 'ideia';

  if (tipo === 'tarefa' && RE_HORA.test(f)) tipo = 'lembrete';

  const titulo = capitalizar(t.slice(corte).replace(/[\s,.;:!?-]+$/, '').trim());
  return { titulo, tipo };
}

/* ---------- 3. Projeto sugerido ---------- */

const PROJETO_POR_PALAVRA = [
  ['mae',      /mulher alem de mae|alem de mae|maternidade|mae empreendedora/],
  ['bycida',   /bycida|by cida|cliente|instagram|conteudo|automacao|landing|agencia|carrossel|reels|\bcopy\b|\bposts?\b/],
  ['hotel',    /hotel|hospede|recepcao|check-?in|check-?out|\bquartos?\b/],
  ['familia',  /familia|filho|filha|marido|\bmae\b|\bpai\b|irmao|irma|\bavo\b|\bavos\b|escola|pedro|aniversario|\bcasa\b/],
  ['trabalho', /apresentacao|reuniao|relatorio|treinamento|contrato|planilha|empresa|\brh\b/],
  ['pessoal',  /dentista|medico|consulta|exame|treino|academia|terapia|cabelo|saude|banco|boleto|\bmeu\b|\bminha\b/],
];
export function sugerirProjeto(titulo) {
  const f = dobrar(titulo);
  const achou = PROJETO_POR_PALAVRA.find(([, re]) => re.test(f));
  return achou ? achou[0] : null;
}

/* ---------- 4. Tarefa grande? ---------- */

const VERBO_GRANDE = /^(?:organizar|planejar|montar|preparar|lancar|reformar|desenvolver|implementar|reestruturar|estruturar|construir|criar|produzir)\b/;
const OBJETO_GRANDE = /^(?:fazer|elaborar|escrever)\b.*\b(?:apresentacao|proposta|projeto|site|evento|festa|campanha|curso|planejamento|relatorio|plano|viagem|mudanca)\b/;
export const ehGrande = (titulo) => {
  const f = dobrar(titulo);
  return VERBO_GRANDE.test(f) || OBJETO_GRANDE.test(f);
};

/* ---------- 5. Emoji do item (só visual) ---------- */

const EMOJIS = [
  [/presente|aniversario|festa/, '🎁'], [/fotograf/, '📸'], [/ligar|telefon/, '📞'],
  [/comprar|mercado|compras/, '🛒'], [/pagar|boleto|fatura|conta\b/, '💳'],
  [/responder|e-?mail|mensagem|whats/, '✉️'], [/apresentacao|slide|proposta/, '📊'],
  [/dentista|medico|consulta|exame/, '🩺'], [/viagem|voo|passagem/, '✈️'],
  [/treino|academia/, '🏋️'], [/reuniao|conversar|falar com/, '💬'],
];
export function emojiDe(item) {
  if (item.tipo === 'ideia') return '💡';
  if (item.tipo === 'lembrete') return '🔔';
  const f = dobrar(item.titulo || '');
  const achou = EMOJIS.find(([re]) => re.test(f));
  return achou ? achou[1] : '📝';
}

/* ---------- API pública (substituível por IA) ---------- */

export async function interpretar(texto) {
  await esperar(900); // simula o "pensando" da IA
  const itens = separar(texto)
    .map(entender)
    .filter((i) => i.titulo.length >= 3)
    .map((i) => ({ ...i, projeto: sugerirProjeto(i.titulo), grande: i.tipo === 'tarefa' && ehGrande(i.titulo) }));
  if (!itens.length && texto.trim().length >= 3) {
    const titulo = capitalizar(texto.trim());
    return [{ titulo, tipo: 'tarefa', projeto: sugerirProjeto(titulo), grande: false }];
  }
  return itens;
}

const MODELOS_DE_PASSOS = [
  [/aniversario|festa|evento|casamento/, ['Definir convidados', 'Escolher local', 'Definir orçamento', 'Escolher decoração', 'Enviar convites']],
  [/apresentacao|slides?|proposta/, ['Abrir apresentação anterior', 'Listar tópicos', 'Separar números', 'Montar primeiro slide']],
  [/viagem/, ['Definir datas', 'Definir orçamento', 'Reservar transporte', 'Reservar hospedagem', 'Montar roteiro']],
  [/site|landing|pagina/, ['Definir o objetivo da página', 'Escrever os textos', 'Escolher as imagens', 'Montar a página', 'Revisar e publicar']],
  [/campanha|lancamento|curso/, ['Definir o objetivo', 'Definir o público', 'Preparar o conteúdo', 'Programar a divulgação']],
];
const PASSOS_GENERICOS = ['Definir como fica "pronto"', 'Listar o que falta', 'Escolher o primeiro passo (o menorzinho)', 'Reservar um horário pra começar'];

export async function sugerirPassos(titulo) {
  await esperar(250);
  const f = dobrar(titulo);
  const achou = MODELOS_DE_PASSOS.find(([re]) => re.test(f));
  return (achou ? achou[1] : PASSOS_GENERICOS).slice();
}
