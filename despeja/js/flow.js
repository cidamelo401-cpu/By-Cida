// Despeja! — Fase 1: o fluxo DESPEJO → INTERPRETAÇÃO → REVISÃO → CONFIRMAÇÃO → CAIXA MENTAL.
// Tela Despeja (captura, voz, revisão, quebra em passos) e tela Caixa Mental.
import { esc, chip, button, note, pageHead, plural } from './components.js';
import { PROJETOS, TIPOS, ORDEM_TIPOS, projetoPorId, uid } from './data.js';
import {
  storeItens, storeAdicionar, storeAtualizar, storeRemover, storeRascunho, storeSalvarRascunho,
} from './store.js';
import { interpretar, sugerirPassos, ehGrande, emojiDe } from './interpreter.js';

let rerender = () => {};
export const ligarFluxo = (fn) => { rerender = fn; };

const MSG_SEM_VOZ = 'Seu navegador não liberou o microfone por aqui. Sem crise, pode despejar digitando.';
const EXEMPLO = 'Preciso comprar o presente do amigo do Pedro, falar com o fotógrafo do hotel e tive uma ideia de criar uma automação nova para a ByCida. Organizar aniversário do Pedro. Lembrar de ligar pro dentista amanhã às 14h.';

const estado = {
  fase: 'captura',          // captura | carregando | revisao | pronto | vazio
  texto: storeRascunho(),
  textoOriginal: '',
  despejoId: null,
  itens: [],                // itens em revisão (ainda NÃO salvos)
  salvos: 0,
  painel: null,             // { itemId, lista:[{id,titulo}] }: sugestão de passos aberta
  vozMsg: '',
  ouvindo: false,
};

/* ================= utilidades ================= */

const resumo = (itens) => ORDEM_TIPOS
  .map((t) => ({ t, n: itens.filter((i) => i.tipo === t).length }))
  .filter(({ n }) => n)
  .map(({ t, n }) => plural(n, TIPOS[t].singular, TIPOS[t].plural))
  .join(' · ');

const projetoChip = (id) => {
  const p = projetoPorId(id);
  return p ? chip(`${p.emoji} ${esc(p.nome)}`, p.tone) : chip('Sem projeto');
};

function achar(id) {
  const emRevisao = estado.itens.find((i) => i.id === id);
  if (emRevisao) return { item: emRevisao, origem: 'revisao' };
  const salvo = storeItens().find((i) => i.id === id);
  return salvo ? { item: salvo, origem: 'caixa' } : null;
}
const persistir = ({ item, origem }) => { if (origem === 'caixa') storeAtualizar(item); };

const subLista = (item) => (item.subtarefas && item.subtarefas.length
  ? `<ul class="subs" aria-label="Passos aprovados">${item.subtarefas.map((s) => `<li>${esc(s.titulo)}</li>`).join('')}</ul>` : '');

const dica = (item) => (item.tipo === 'tarefa' && item.grande && !(item.subtarefas && item.subtarefas.length) && estado.painel?.itemId !== item.id
  ? `<div class="hint-big"><p class="hint-big__text">Isso parece grandinho 👀</p>
      ${button({ label: 'Quebrar em passos', variant: 'blue', size: 'sm', attrs: `data-action="quebrar" data-id="${item.id}"` }).replace('class="btn', 'class="btn btn--caps')}</div>` : '');

function painelPassos(item) {
  if (!estado.painel || estado.painel.itemId !== item.id) return '';
  const { lista } = estado.painel;
  return `<div class="steps">
    <p class="steps__title">Sugestão de passos</p>
    <p class="steps__sub">Nada entra sem você aprovar. Edite, aprove ou exclua cada passo.</p>
    <ul class="steps__list">${lista.map((p) => `<li class="step">
      <textarea class="step__input" rows="1" data-autosize data-field="passo" data-id="${item.id}" data-passo="${p.id}" aria-label="Passo">${esc(p.titulo)}</textarea>
      <button type="button" class="icon-btn icon-btn--ok" data-action="passo-ok" data-id="${item.id}" data-passo="${p.id}" aria-label="Aprovar este passo">✓</button>
      <button type="button" class="icon-btn" data-action="passo-x" data-id="${item.id}" data-passo="${p.id}" aria-label="Excluir este passo">✕</button>
    </li>`).join('')}</ul>
    <div class="steps__actions">
      ${button({ label: 'Aprovar todas', variant: 'green', size: 'sm', attrs: `data-action="passos-todos" data-id="${item.id}"` })}
      ${button({ label: 'Cancelar', variant: 'ghost', size: 'sm', attrs: 'data-action="passos-cancelar"' })}
    </div></div>`;
}

/* ================= voz ================= */

let rec = null;
const vozSuportada = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const campoTexto = () => document.getElementById('despejo-texto');

function avisar(msg) {
  estado.vozMsg = msg;
  const el = document.querySelector('[data-voz-aviso]');
  if (el) el.textContent = msg;
}
function marcarMic(on) {
  estado.ouvindo = on;
  document.querySelectorAll('[data-mic]').forEach((b) => {
    b.classList.toggle('is-listening', on);
    b.setAttribute('aria-pressed', String(on));
    const l = b.querySelector('.mic-label');
    if (l) l.textContent = on ? 'Ouvindo… toque pra parar' : 'Falar';
  });
}
function atualizarOrganizar() {
  const b = document.querySelector('[data-organizar]');
  if (b) b.setAttribute('aria-disabled', String(!estado.texto.trim()));
}
function escreverTexto(t) {
  estado.texto = t;
  const ta = campoTexto();
  if (ta) { ta.value = t; ta.scrollTop = ta.scrollHeight; }
  storeSalvarRascunho(t);
  atualizarOrganizar();
}

function iniciarVoz() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { avisar(MSG_SEM_VOZ); return; }
  try {
    rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.interimResults = true;
    const base = estado.texto.trimEnd();
    let finais = '';
    const juntar = (...partes) => partes.map((p) => p.trim()).filter(Boolean).join(' ');
    rec.onresult = (ev) => {
      let parcial = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finais = juntar(finais, t); else parcial += t;
      }
      escreverTexto(juntar(base, finais, parcial));
    };
    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') avisar(MSG_SEM_VOZ);
      else if (ev.error === 'no-speech') avisar('Não ouvi nada. Toca no microfone e fala de novo.');
      else if (ev.error !== 'aborted') avisar('A voz falhou por aqui. Sem crise, pode despejar digitando.');
    };
    rec.onend = () => { marcarMic(false); rec = null; };
    rec.start();
    marcarMic(true);
    avisar('Pode falar. Não precisa organizar.');
  } catch {
    rec = null;
    marcarMic(false);
    avisar(MSG_SEM_VOZ);
  }
}
export function pararVoz() {
  if (rec) { try { rec.abort(); } catch { /* já parou */ } rec = null; }
  estado.ouvindo = false;
}

/* ================= TELA DESPEJA ================= */

function captura() {
  const vazio = !estado.texto.trim();
  return `
  ${pageHead({ kicker: 'Despeja', title: 'Pode despejar.', mark: 'pink', sub: 'Não organiza. Só fala. Eu cuido do resto.' })}
  <p class="hand-note">Seu cérebro abriu outra aba? Joga aqui.</p>
  <textarea id="despejo-texto" class="pad-input" data-field="texto" rows="7" aria-label="Seu despejo"
    placeholder="Pode despejar tudo aqui.&#10;Comprar presente, responder alguém, aquela ideia aleatória das 23h...">${esc(estado.texto)}</textarea>
  <p class="voz-aviso" data-voz-aviso role="status" aria-live="polite">${esc(estado.vozMsg)}</p>
  <div class="pad-actions">
    <button type="button" class="btn btn--pink btn--lg ${estado.ouvindo ? 'is-listening' : ''}" data-action="falar" data-mic aria-pressed="${estado.ouvindo}">
      <svg class="icon" aria-hidden="true"><use href="#i-mic"/></svg><span class="mic-label">${estado.ouvindo ? 'Ouvindo… toque pra parar' : 'Falar'}</span>
    </button>
    <button type="button" class="btn btn--lg" data-action="escrever">
      <svg class="icon" aria-hidden="true"><use href="#i-pen"/></svg><span>Escrever</span>
    </button>
  </div>
  <div class="organiza">
    <button type="button" class="btn btn--green btn--lg btn--block" data-action="organizar" data-organizar aria-disabled="${vazio}">
      <span>✨ Organiza pra mim</span>
    </button>
    <button type="button" class="link-btn" data-action="exemplo">Preencher com um exemplo</button>
  </div>`;
}

const carregando = () => `
  <section class="loading" role="status" aria-live="polite">
    <p class="loading__emoji" aria-hidden="true">🧠</p>
    <h1 class="loading__title">Lendo seu despejo…</h1>
    <p class="muted">Separando o que é tarefa, ideia e lembrete.</p>
    <p class="loading__dots" aria-hidden="true"><span></span><span></span><span></span></p>
  </section>`;

function cartaoRevisao(it) {
  return `<article class="rev" data-id="${it.id}">
    <div class="rev__top">
      <span class="rev__emoji" aria-hidden="true">${emojiDe(it)}</span>
      <textarea class="rev__title" rows="1" data-autosize data-field="titulo" data-id="${it.id}" aria-label="Título do item">${esc(it.titulo)}</textarea>
    </div>
    <div class="seg" role="group" aria-label="Tipo do item">
      ${ORDEM_TIPOS.map((t) => `<button type="button" class="seg__btn seg__btn--${t}" data-action="tipo" data-id="${it.id}" data-tipo="${t}" aria-pressed="${it.tipo === t}">${TIPOS[t].label}</button>`).join('')}
    </div>
    <label class="field"><span class="field__label">Projeto sugerido</span>
      <select class="select" data-change="projeto" data-id="${it.id}">
        ${PROJETOS.map((p) => `<option value="${p.id}" ${it.projeto === p.id ? 'selected' : ''}>${p.emoji} ${esc(p.nome)}</option>`).join('')}
        <option value="" ${!it.projeto ? 'selected' : ''}>Sem projeto</option>
      </select>
    </label>
    ${dica(it)}${painelPassos(it)}${subLista(it)}
    <div class="rev__actions">
      ${button({ label: 'Excluir', variant: 'ghost', size: 'sm', attrs: `data-action="excluir-rev" data-id="${it.id}"` })}
      ${button({ label: 'Aprovar', variant: 'green', size: 'sm', attrs: `data-action="aprovar-item" data-id="${it.id}"` })}
    </div>
  </article>`;
}

function revisao() {
  const aprovarTudo = button({ label: 'Aprovar tudo', variant: 'green', size: 'lg', block: true, attrs: 'data-action="aprovar-tudo"' });
  return `
  ${pageHead({ kicker: 'Revisão', title: 'Olha o que eu encontrei aqui 👀', mark: 'blue', sub: 'Eu sugiro. Você decide. Nada é salvo antes de você aprovar.' })}
  <p class="rev-resumo">${resumo(estado.itens)}</p>
  <div class="rev-lista">${aprovarTudo}${estado.itens.map(cartaoRevisao).join('')}${aprovarTudo}
    ${button({ label: 'Voltar e editar o texto', variant: 'ghost', block: true, attrs: 'data-action="voltar"' })}
  </div>`;
}

const pronto = () => `
  <section class="done">
    <p class="done__emoji" aria-hidden="true">✨</p>
    <h1 class="done__title">Pronto. Tirei isso da sua cabeça.</h1>
    <p class="muted">${plural(estado.salvos, 'item foi', 'itens foram')} para a Caixa Mental.</p>
    <div class="done__actions">
      ${button({ label: 'Ver Caixa Mental', variant: 'green', size: 'lg', block: true, href: '#/caixa' })}
      ${button({ label: 'Despejar mais', variant: 'ghost', block: true, attrs: 'data-action="novo"' })}
    </div>
  </section>`;

const vazioRevisao = () => `
  <section class="done">
    <p class="done__emoji" aria-hidden="true">🤷</p>
    <h1 class="done__title">Sem nada pra aprovar.</h1>
    <p class="muted">Você excluiu tudo. Sem problema, dá pra despejar de novo.</p>
    <div class="done__actions">${button({ label: 'Despejar de novo', variant: 'pink', size: 'lg', block: true, attrs: 'data-action="novo"' })}</div>
  </section>`;

export function despejaView() {
  switch (estado.fase) {
    case 'carregando': return carregando();
    case 'revisao': return revisao();
    case 'pronto': return pronto();
    case 'vazio': return vazioRevisao();
    default: return captura();
  }
}

/* ================= TELA CAIXA MENTAL ================= */

function quando(iso) {
  if (!iso) return '';
  const d = new Date(iso), hoje = new Date();
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((dia(hoje) - dia(d)) / 86400000);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function linhaCaixa(it) {
  return `<li class="inbox-row">
    <span class="inbox-row__emoji" aria-hidden="true">${emojiDe(it)}</span>
    <div class="inbox-row__body">
      <p class="inbox-row__title">${esc(it.titulo)}</p>
      <p class="inbox-row__meta">${projetoChip(it.projeto)} <span class="muted small">${quando(it.criadoEm)}</span></p>
      ${subLista(it)}${dica(it)}${painelPassos(it)}
    </div>
    <button type="button" class="icon-btn" data-action="caixa-excluir" data-id="${it.id}" aria-label="Excluir “${esc(it.titulo)}”"><span class="icon-btn__txt" aria-hidden="true">✕</span></button>
  </li>`;
}

export function caixaView() {
  const itens = storeItens();
  const cabeca = pageHead({
    kicker: 'Caixa Mental', title: 'Tudo que você despejou', mark: 'blue',
    sub: itens.length ? `${resumo(itens)}. Nada some daqui sozinho.` : 'Nada some daqui sozinho. Fica até você decidir.',
  });
  if (!itens.length) {
    return `${cabeca}
    <section class="done done--left">
      <p class="done__emoji" aria-hidden="true">🫙</p>
      <h2 class="done__title">A caixa está vazia.</h2>
      <p class="muted">Seu cérebro está leve… ou ainda não despejou.</p>
      <div class="done__actions">${button({ label: 'Tirar da cabeça', variant: 'pink', size: 'lg', block: true, href: '#/despeja', iconName: 'pen' })}</div>
    </section>`;
  }
  const dicas = { ideia: 'Ideia fica ideia até você decidir o que fazer com ela.' };
  const secoes = ORDEM_TIPOS.map((t) => {
    const lista = itens.filter((i) => i.tipo === t);
    const tabTone = TIPOS[t].tone === 'yellow' ? '' : TIPOS[t].tone;
    return note({
      tab: `${TIPOS[t].secao} · ${lista.length}`, tabTone, tone: TIPOS[t].tone,
      body: `${dicas[t] && lista.length ? `<p class="small muted">${dicas[t]}</p>` : ''}${lista.length
        ? `<ul class="inbox-list">${lista.map(linhaCaixa).join('')}</ul>`
        : `<p class="muted">Nenhum${t === 'tarefa' || t === 'ideia' ? 'a' : ''} ${TIPOS[t].singular} por aqui.</p>`}`,
    });
  }).join('');
  return `${cabeca}<div class="stack stack--lg" style="margin-top:8px">${secoes}</div>`;
}

/* ================= AÇÕES ================= */

function irParaTopo(fase) { estado.fase = fase; rerender({ topo: true }); }

function aprovar(lista) {
  if (!lista.length) return;
  const agora = new Date().toISOString();
  storeAdicionar(
    lista.map((i) => ({ ...i, criadoEm: agora, despejoId: estado.despejoId, subtarefas: i.subtarefas || [] })),
    { id: estado.despejoId, texto: estado.textoOriginal },
  );
  const ids = new Set(lista.map((i) => i.id));
  estado.itens = estado.itens.filter((i) => !ids.has(i.id));
  estado.salvos += lista.length;
  if (estado.painel && ids.has(estado.painel.itemId)) estado.painel = null;
}

function fecharSeAcabou() {
  if (estado.itens.length) { rerender(); return; }
  if (estado.salvos > 0) { estado.texto = ''; storeSalvarRascunho(''); irParaTopo('pronto'); } else irParaTopo('vazio');
}

async function organizar() {
  const texto = estado.texto.trim();
  if (!texto) { avisar('Escreve ou fala alguma coisa primeiro 🙂'); return; }
  pararVoz();
  estado.textoOriginal = texto;
  estado.despejoId = uid();
  estado.salvos = 0;
  estado.painel = null;
  irParaTopo('carregando');
  let itens = [];
  try { itens = await interpretar(texto); } catch { itens = []; }
  if (estado.fase !== 'carregando') return;
  if (!itens.length) {
    estado.vozMsg = 'Não achei nada pra organizar aí. Quer escrever de outro jeito?';
    irParaTopo('captura');
    return;
  }
  estado.itens = itens.map((i) => ({ ...i, id: uid(), subtarefas: [] }));
  irParaTopo('revisao');
}

export function acao(nome, el) {
  const id = el.dataset.id;
  switch (nome) {
    case 'falar':
      if (estado.ouvindo && rec) { try { rec.stop(); } catch { /* ok */ } } else iniciarVoz();
      return;
    case 'escrever': { const ta = campoTexto(); if (ta) ta.focus(); return; }
    case 'exemplo': escreverTexto(EXEMPLO); return;
    case 'organizar':
      if (el.getAttribute('aria-disabled') === 'true') { avisar('Escreve ou fala alguma coisa primeiro 🙂'); return; }
      organizar();
      return;
    case 'voltar': estado.itens = []; estado.painel = null; irParaTopo('captura'); return;
    case 'novo':
      estado.texto = ''; estado.itens = []; estado.salvos = 0; estado.painel = null; estado.vozMsg = '';
      storeSalvarRascunho('');
      irParaTopo('captura');
      return;

    case 'tipo': {
      const a = achar(id); if (!a) return;
      a.item.tipo = el.dataset.tipo;
      a.item.grande = a.item.tipo === 'tarefa' && ehGrande(a.item.titulo);
      if (a.item.tipo !== 'tarefa' && estado.painel?.itemId === id) estado.painel = null;
      persistir(a); rerender();
      return;
    }
    case 'excluir-rev':
      estado.itens = estado.itens.filter((i) => i.id !== id);
      if (estado.painel?.itemId === id) estado.painel = null;
      fecharSeAcabou();
      return;
    case 'aprovar-item': { const it = estado.itens.find((i) => i.id === id); if (it) aprovar([it]); fecharSeAcabou(); return; }
    case 'aprovar-tudo': aprovar(estado.itens.slice()); fecharSeAcabou(); return;

    case 'quebrar': {
      const a = achar(id); if (!a) return;
      estado.painel = { itemId: id, lista: [] };
      rerender();
      sugerirPassos(a.item.titulo).then((passos) => {
        if (estado.painel?.itemId !== id) return;
        estado.painel.lista = passos.map((titulo) => ({ id: uid(), titulo }));
        rerender();
      });
      return;
    }
    case 'passo-ok': {
      const a = achar(id); if (!a || !estado.painel) return;
      const p = estado.painel.lista.find((x) => x.id === el.dataset.passo); if (!p || !p.titulo.trim()) return;
      a.item.subtarefas = [...(a.item.subtarefas || []), { id: uid(), titulo: p.titulo.trim(), feita: false }];
      estado.painel.lista = estado.painel.lista.filter((x) => x !== p);
      if (!estado.painel.lista.length) estado.painel = null;
      persistir(a); rerender();
      return;
    }
    case 'passo-x':
      if (!estado.painel) return;
      estado.painel.lista = estado.painel.lista.filter((x) => x.id !== el.dataset.passo);
      if (!estado.painel.lista.length) estado.painel = null;
      rerender();
      return;
    case 'passos-todos': {
      const a = achar(id); if (!a || !estado.painel) return;
      const novos = estado.painel.lista.filter((p) => p.titulo.trim()).map((p) => ({ id: uid(), titulo: p.titulo.trim(), feita: false }));
      a.item.subtarefas = [...(a.item.subtarefas || []), ...novos];
      estado.painel = null;
      persistir(a); rerender();
      return;
    }
    case 'passos-cancelar': estado.painel = null; rerender(); return;

    case 'caixa-excluir':
      if (el.dataset.armed !== '1') {   // 1º toque arma, 2º confirma (não existe confirm() aqui)
        el.dataset.armed = '1';
        el.classList.add('is-armed');
        el.querySelector('.icon-btn__txt').textContent = 'Excluir?';
        setTimeout(() => {
          if (!el.isConnected) return;
          el.dataset.armed = '0'; el.classList.remove('is-armed');
          el.querySelector('.icon-btn__txt').textContent = '✕';
        }, 3000);
        return;
      }
      if (estado.painel?.itemId === id) estado.painel = null;
      storeRemover(id); rerender();
      return;
    default:
  }
}

// digitação (sem redesenhar a tela, para não perder o foco)
export function campo(el) {
  const f = el.dataset.field;
  if (f === 'texto') {
    estado.texto = el.value;
    storeSalvarRascunho(el.value);
    atualizarOrganizar();
  } else if (f === 'titulo') {
    const a = achar(el.dataset.id); if (a) { a.item.titulo = el.value; persistir(a); }
  } else if (f === 'passo' && estado.painel) {
    const p = estado.painel.lista.find((x) => x.id === el.dataset.passo); if (p) p.titulo = el.value;
  }
}

export function mudou(el) {
  if (el.dataset.change === 'projeto') {
    const a = achar(el.dataset.id);
    if (a) { a.item.projeto = el.value || null; persistir(a); }
  }
}
