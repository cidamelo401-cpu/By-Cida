// Despeja! — componentes reutilizáveis.
// Cada função devolve um pedaço de HTML. Ainda não há lógica real: só visual.

export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
// Escapa texto digitado pelo usuário antes de colocar em HTML
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR');

export const icon = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

// As 7 áreas do produto
export const AREAS = {
  hoje:     { label: 'Hoje',          icon: 'sun' },
  despeja:  { label: 'Despeja',       icon: 'pen' },
  caixa:    { label: 'Caixa Mental',  short: 'Caixa', icon: 'inbox' },
  projetos: { label: 'Projetos',      icon: 'folder' },
  semana:   { label: 'Semana',        icon: 'week' },
  financas: { label: 'Finanças',      icon: 'coin' },
  config:   { label: 'Configurações', icon: 'sliders' },
};
export const MORE = ['semana', 'financas', 'config'];

/* ---------- Botão principal ---------- */
export function button({ label, href, variant = '', size = '', iconName = '', block = false, disabled = false, attrs = '' }) {
  const cls = ['btn', variant && `btn--${variant}`, size && `btn--${size}`, block && 'btn--block'].filter(Boolean).join(' ');
  const inner = `${iconName ? icon(iconName) : ''}<span>${label}</span>`;
  if (href) return `<a class="${cls}" href="${href}" ${attrs}>${inner}</a>`;
  return `<button type="button" class="${cls}" ${disabled ? 'aria-disabled="true"' : ''} ${attrs}>${inner}</button>`;
}

/* ---------- Chip e status ---------- */
export const chip = (label, tone = '', iconName = '') =>
  `<span class="chip ${tone ? `chip--${tone}` : ''}">${iconName ? icon(iconName) : ''}${label}</span>`;

export const status = (label, tone = 'yellow') => `<span class="status status--${tone}">${label}</span>`;

/* ---------- Bloquinho / card ---------- */
export function note({ tab = '', tone = '', tabTone = '', quiet = false, aside = '', body = '', cls = '' }) {
  const c = ['note', tone && `note--${tone}`, quiet && 'note--quiet', !tab && 'note--flush', cls].filter(Boolean).join(' ');
  return `<section class="${c}">
    ${tab ? `<h2 class="note__tab ${tabTone ? `note__tab--${tabTone}` : ''}">${tab}</h2>` : ''}
    ${aside ? `<div class="note__aside">${aside}</div>` : ''}
    ${body}
  </section>`;
}

/* ---------- Tarefa ---------- */
export function task({ title, meta = [], done = false, big = false }) {
  return `<li class="task ${done ? 'is-done' : ''} ${big ? 'task--big' : ''}">
    <button type="button" class="task__check" aria-pressed="${done}" aria-label="Marcar “${title}” como feita">
      <span class="task__box">${icon('check')}</span>
    </button>
    <div class="task__body">
      <span class="task__title">${title}</span>
      ${meta.length ? `<span class="task__meta">${meta.join('')}</span>` : ''}
    </div>
  </li>`;
}
export const taskList = (items) => `<ul class="tasks">${items.map(task).join('')}</ul>`;

/* ---------- Projeto ---------- */
export function project({ name, emoji, tone = 'blue', tasks = 0, ideas = 0, href = '#/projetos' }) {
  return `<a class="project project--${tone}" href="${href}">
    <span class="project__icon" aria-hidden="true">${emoji}</span>
    <span>
      <span class="project__name">${name}</span><br>
      <span class="project__meta">${plural(tasks, 'tarefa', 'tarefas')} · ${plural(ideas, 'ideia', 'ideias')}</span>
    </span>
    ${icon('chevron').replace('class="icon"', 'class="icon project__go"')}
  </a>`;
}
export const projectNew = () =>
  `<a class="project project--new" href="#/projetos">${icon('plus')}<span>Novo projeto</span></a>`;

/* ---------- Categoria (orçamento mensal) ---------- */
export function category({ name, spent, budget, tone = 'green-s' }) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  return `<div class="category">
    <div class="category__top">
      <span class="category__name">${name}</span>
      <span class="category__values">${brl(spent)} / ${brl(budget)}</span>
    </div>
    <div class="bar" role="img" aria-label="${pct}% do orçamento usado"><span class="bar__fill" style="--pct:${pct}%;--tone:var(--${tone})"></span></div>
    <span class="category__left">${brl(budget - spent)} disponíveis</span>
  </div>`;
}

/* ---------- Faixa "Tirar da cabeça" ---------- */
export const dumpBanner = () => `<a class="dump" href="#/despeja">
  <span class="dump__icon">${icon('pen')}</span>
  <span class="dump__text">
    <span class="dump__title">Tirar da cabeça</span>
    <span class="dump__sub">Seu cérebro abriu 17 abas. Pode despejar.</span>
  </span>
  ${icon('chevron').replace('class="icon"', 'class="icon dump__go"')}
</a>`;

/* ---------- Título de página ---------- */
export const pageHead = ({ kicker = '', title, sub = '', mark = '' }) => `<header class="page-head">
  ${kicker ? `<p class="page-head__kicker">${kicker}</p>` : ''}
  <h1 class="page-head__title">${mark ? `<span class="mark mark--${mark}">${title}</span>` : title}</h1>
  ${sub ? `<p class="page-head__sub">${sub}</p>` : ''}
</header>`;

export const soon = (fase, texto) =>
  `<p class="soon">${icon('clock')}<span>${texto} <strong>Chega na Fase ${fase}.</strong></span></p>`;

/* ---------- Navegação ---------- */
const current = (on) => (on ? ' aria-current="page"' : '');

// Barra de baixo (celular): Hoje · Caixa · [DESPEJA] · Projetos · Mais
export function tabbar(route) {
  const tab = (id) => {
    const a = AREAS[id];
    return `<a class="tab" href="#/${id}"${current(route === id)}>
      <span class="tab__icon">${icon(a.icon)}</span><span>${a.short || a.label}</span></a>`;
  };
  return `<nav class="tabbar" aria-label="Navegação principal">
    ${tab('hoje')}${tab('caixa')}
    <a class="tab tab--fab" href="#/despeja"${current(route === 'despeja')} aria-label="Despeja: tirar da cabeça">
      <span class="fab">${icon('pen')}</span><span class="tab__label">Despeja!</span>
    </a>
    ${tab('projetos')}
    <button type="button" class="tab" data-more aria-haspopup="true" aria-expanded="false"${current(MORE.includes(route))}>
      <span class="tab__icon">${icon('dots')}</span><span>Mais</span>
    </button>
  </nav>`;
}

// Folha "Mais" (celular): o que não cabe na barra
export function moreSheet(route) {
  return `<div class="sheet-backdrop" data-more-close hidden></div>
  <div class="sheet" data-sheet hidden role="menu" aria-label="Mais áreas">
    ${MORE.map((id) => `<a class="row" role="menuitem" href="#/${id}"${current(route === id)}>
      ${icon(AREAS[id].icon)}<span>${AREAS[id].label}</span></a>`).join('')}
  </div>`;
}

// Barra lateral (desktop): todas as 7 áreas
export function sidebar(route) {
  const link = (id) => `<a class="side-link" href="#/${id}"${current(route === id)}>${icon(AREAS[id].icon)}<span>${AREAS[id].label}</span></a>`;
  return `<aside class="sidebar">
    <a class="brand" href="#/hoje">${icon('sun').replace('class="icon"', 'class="icon brand__sun"')}Despeja!</a>
    ${button({ label: 'Tirar da cabeça', href: '#/despeja', variant: 'pink', block: true, iconName: 'pen' }).replace('class="btn', 'class="btn btn--dump')}
    ${['hoje', 'caixa', 'projetos', 'semana', 'financas', 'config'].map(link).join('')}
    <div class="sidebar__foot"><span class="avatar">C</span><span>Cida</span></div>
  </aside>`;
}
