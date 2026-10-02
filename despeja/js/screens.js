// Despeja! — telas. Tudo com dados fictícios; nenhuma funcionalidade real ainda.
import {
  icon, chip, status, note, task, taskList, button, project, projectNew,
  category, dumpBanner, pageHead, soon, brl, plural,
} from './components.js';
import { despejaView as despeja, caixaView as caixa } from './flow.js';

const hoje = () => {
  const bruta = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const data = bruta.charAt(0).toUpperCase() + bruta.slice(1);
  return `
  <div class="today">
    <header class="hello today__wide">
      <p class="hello__date">${data}</p>
      <h1 class="hello__title">Bom dia, <span class="mark">Cida</span> ☀️</h1>
      <p class="hello__sub">Hoje cabe pouca coisa. Vamos escolher bem.</p>
    </header>

    <div class="today__wide" style="margin-bottom:8px">${dumpBanner()}</div>

    <div class="today__col">
      ${note({ tab: 'Precisa acontecer', tabTone: 'pink', tone: 'pink', body: taskList([
        { title: 'Finalizar apresentação', big: true, meta: [chip('~25 min', 'yellow', 'clock'), status('Prazo hoje', 'pink')] },
      ]) })}

      ${note({ tab: 'Importantes', tabTone: 'blue', body: taskList([
        { title: 'Responder fotógrafo', meta: [chip('Hotel', 'blue'), chip('~10 min', '', 'clock')] },
        { title: 'Comprar presente', meta: [chip('Família', 'pink'), chip('~30 min', '', 'clock')] },
      ]) })}

      ${note({ tab: 'Rapidinhas', body: `
        <div class="quick">
          <p class="quick__headline"><span class="quick__count">3</span><span>tarefas de até 10 min</span></p>
          <p class="quick__list">Pagar boleto · Confirmar dentista · Responder a Ana</p>
        </div>` })}
    </div>

    <div class="today__col">
      <div class="cta-wrap">
        ${button({ label: 'Me diz o que fazer', variant: 'green', size: 'lg', block: true, iconName: 'bolt', href: '#/hoje' })}
        <p class="cta-wrap__hint">Escolho uma coisa só pra você. Sem drama.</p>
      </div>

      ${note({ tab: '🏋️ Treino de hoje', tabTone: 'green', quiet: true, body: `
        <div class="treino">
          <span class="treino__title muted">Movimento conta.</span>
          <button type="button" class="toggle" aria-pressed="false" data-toggle>
            <span class="toggle__dot" aria-hidden="true">○</span><span class="toggle__text">Ainda não treinei</span>
          </button>
        </div>` })}

      ${note({ tab: '💰 Resumo financeiro', tabTone: 'lilac', quiet: true, body: `
        <div class="money">
          <p class="money__label">Quanto ainda pode gastar no mês</p>
          <p class="money__value">${brl(1840)}</p>
          <div class="bar" role="img" aria-label="62% do mês já gasto"><span class="bar__fill" style="--pct:62%;--tone:var(--lilac-s)"></span></div>
          <p class="money__foot"><span>Gasto: ${brl(2960)}</span><span>Previsto: ${brl(4800)}</span></p>
        </div>` })}
    </div>
  </div>`;
};

const projetos = () => `
  ${pageHead({ kicker: 'Projetos', title: 'Cada coisa no seu canto', mark: 'green', sub: 'Tarefas, ideias e “depois” agrupados por contexto.' })}
  <div class="grid-2" style="margin-top:14px">
    ${project({ name: 'Pessoal', emoji: '🌿', tone: 'green', tasks: 4, ideas: 2 })}
    ${project({ name: 'Família', emoji: '🏡', tone: 'pink', tasks: 6, ideas: 1 })}
    ${project({ name: 'Trabalho', emoji: '💼', tone: 'blue', tasks: 8, ideas: 3 })}
    ${project({ name: 'Hotel', emoji: '🛎️', tone: 'yellow', tasks: 5, ideas: 0 })}
    ${project({ name: 'Mulher Além de Mãe', emoji: '💜', tone: 'lilac', tasks: 3, ideas: 7 })}
    ${project({ name: 'ByCida', emoji: '✨', tone: 'pink', tasks: 9, ideas: 12 })}
    ${projectNew()}
  </div>
  ${soon(2, 'Aqui vão ficar tarefas, ideias e “depois” de cada projeto.')}`;

const DIAS = [
  ['segunda', 'pink', 3], ['terça', 'blue', 2], ['quarta', 'lilac', 4],
  ['quinta', 'yellow', 7], ['sexta', 'green', 2], ['sábado', 'pink', 1], ['domingo', 'blue', 0],
];
const semana = () => `
  ${pageHead({ kicker: 'Semana', title: 'Como a carga se espalha', mark: 'pink', sub: 'Não é calendário. É pra ver se algum dia está pesado demais.' })}
  <div class="week" style="margin-top:16px">
    ${DIAS.map(([d, tone, n]) => `<section class="note day" style="--tone:var(--${tone})">
      <h2 class="day__name">${d}</h2>
      <div class="day__info">
        <span class="day__count">${n === 0 ? 'livre ✨' : plural(n, 'tarefa', 'tarefas')}</span>
        <div class="bar" role="img" aria-label="${n} tarefas"><span class="bar__fill" style="--pct:${Math.min(100, n * 14)}%;--tone:var(--${n >= 6 ? 'pink-s' : 'green-s'})"></span></div>
        ${n >= 6 ? status('Quinta tá pesada 👀', 'pink') : ''}
      </div></section>`).join('')}
  </div>
  ${soon(3, 'Aqui vai ficar a distribuição da semana e as sugestões.')}`;

const financas = () => `
  ${pageHead({ kicker: 'Finanças', title: 'Dinheiro sem susto', mark: 'blue', sub: 'Financeiro da família, simples e rápido.' })}
  ${note({ tab: 'Quanto ainda pode gastar', tabTone: 'lilac', tone: 'lilac', body: `
    <div class="money"><p class="money__value">${brl(1840)}</p>
    <p class="money__foot"><span>Entrou ${brl(7600)}</span><span>Ainda vai sair ${brl(2800)}</span></p></div>` })}
  ${note({ tab: 'Orçamento por categoria', tabTone: 'green', body: `
    ${category({ name: 'Alimentação', spent: 920, budget: 1500 })}
    ${category({ name: 'Transporte', spent: 410, budget: 600, tone: 'yellow-s' })}
    ${category({ name: 'Lazer', spent: 380, budget: 400, tone: 'pink-s' })}` })}
  ${soon(4, 'Aqui vão ficar gastos, contas, cartões e faturas.')}`;

const config = () => {
  const row = (emoji, label) => `<a class="row" href="#/config"><span class="row__emoji">${emoji}</span><span>${label}</span>${icon('chevron')}</a>`;
  return `
  ${pageHead({ kicker: 'Configurações', title: 'Ajustes', mark: 'yellow', sub: 'Deixa tudo do seu jeito.' })}
  ${note({ cls: '', body: [
    row('📁', 'Projetos'), row('🏷️', 'Categorias financeiras'), row('🎯', 'Orçamento das categorias'),
    row('💳', 'Cartões'), row('🔁', 'Contas recorrentes'), row('🎛️', 'Preferências'), row('👨‍👩‍👧', 'Membros do financeiro'),
  ].join('') })}
  <p style="margin-top:20px">${button({ label: 'Ver kit de componentes', href: '#/kit', variant: 'ghost', iconName: 'pen' })}</p>`;
};

// Vitrine dos componentes (para conferir o visual)
const kit = () => `
  ${pageHead({ kicker: 'Kit', title: 'Componentes', mark: 'pink', sub: 'Tudo que existe nesta fase, num lugar só.' })}
  <div class="section"><h2 class="section__title">Botões</h2>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${button({ label: 'Amarelo' })}${button({ label: 'Rosa', variant: 'pink' })}${button({ label: 'Verde', variant: 'green' })}${button({ label: 'Azul', variant: 'blue' })}${button({ label: 'Fantasma', variant: 'ghost' })}
    </div>
    <div style="margin-top:14px">${button({ label: 'Me diz o que fazer', variant: 'green', size: 'lg', block: true, iconName: 'bolt' })}</div>
  </div>
  <div class="section"><h2 class="section__title">Status e chips</h2>
    <p style="display:flex;gap:14px;flex-wrap:wrap">${status('Prazo hoje', 'pink')}${status('Em andamento', 'blue')}${status('Grandinho', 'yellow')}${status('Feito', 'green')}${status('Pensando', 'lilac')}</p>
    <p style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${chip('Hotel', 'blue')}${chip('Família', 'pink')}${chip('~10 min', 'yellow', 'clock')}${chip('Pessoal', 'green')}${chip('Ideia', 'lilac')}</p>
  </div>
  <div class="section"><h2 class="section__title">Tarefas</h2>
    ${note({ tab: 'Exemplo', body: taskList([
      { title: 'Tarefa normal', meta: [chip('Hotel', 'blue'), chip('~10 min', '', 'clock')] },
      { title: 'Tarefa feita', done: true },
      { title: 'Tarefa em destaque', big: true, meta: [status('Prazo hoje', 'pink')] },
    ]) })}
  </div>
  <div class="section"><h2 class="section__title">Bloquinhos</h2>
    <div class="grid-2">
      ${[['pink', 'Rosa'], ['blue', 'Azul'], ['yellow', 'Amarelo'], ['green', 'Verde'], ['lilac', 'Lilás']].map(([t, nome]) => note({ tab: nome, tabTone: t === 'yellow' ? '' : t, tone: t, body: '<p>Bloquinho colorido para orientar, sem poluir.</p>' })).join('')}
      ${note({ tab: 'Discreto', quiet: true, body: '<p class="muted">Versão tracejada, para o que fica em segundo plano.</p>' })}
    </div>
  </div>
  <div class="section"><h2 class="section__title">Projeto e categoria</h2>
    <div class="grid-2">
      ${project({ name: 'Hotel', emoji: '🛎️', tone: 'yellow', tasks: 5, ideas: 0 })}
      ${note({ cls: '', body: category({ name: 'Alimentação', spent: 920, budget: 1500 }) })}
    </div>
  </div>`;

export const SCREENS = { hoje, despeja, caixa, projetos, semana, financas, config, kit };
export const TITLES = {
  hoje: 'Hoje', despeja: 'Despeja', caixa: 'Caixa Mental', projetos: 'Projetos',
  semana: 'Semana', financas: 'Finanças', config: 'Configurações', kit: 'Componentes',
};
