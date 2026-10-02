// Despeja! — arranque: monta a casca, troca de tela pelo endereço (#/hoje, #/despeja…)
// e liga os pequenos efeitos visuais. Sem dados reais, sem salvar nada.
import { sidebar, tabbar, moreSheet, icon } from './components.js';
import { SCREENS, TITLES } from './screens.js';
import { ligarFluxo, pararVoz, acao, campo, mudou } from './flow.js';

const app = document.getElementById('app');

const routeFromHash = () => {
  const id = location.hash.replace(/^#\/?/, '');
  return SCREENS[id] ? id : 'hoje';
};

function render() {
  pararVoz(); // trocou de tela: o microfone não fica aberto
  const route = routeFromHash();
  app.innerHTML = `
    ${sidebar(route)}
    <div>
      <div class="topbar">
        <a class="brand" href="#/hoje">${icon('sun').replace('class="icon"', 'class="icon brand__sun"')}Despeja!</a>
        <span class="avatar" aria-hidden="true">C</span>
      </div>
      <main class="main"><div class="view">${SCREENS[route]()}</div></main>
    </div>
    ${tabbar(route)}
    ${moreSheet(route)}`;
  autoajustar();
  document.title = `${TITLES[route]} · Despeja!`;
  window.scrollTo(0, 0);
}

// Campos de título crescem com o texto (títulos longos não ficam cortados)
function autoajustar(raiz = app) {
  raiz.querySelectorAll('textarea[data-autosize]').forEach((t) => { t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`; });
}

// Redesenha só o miolo da tela (mantém menu, rolagem e microfone). Usado pelo fluxo do Despeja.
function renderView({ topo = false } = {}) {
  const view = app.querySelector('.view');
  if (!view) return;
  view.innerHTML = SCREENS[routeFromHash()]();
  autoajustar(view);
  if (topo) window.scrollTo({ top: 0 });
}
ligarFluxo(renderView);

window.addEventListener('hashchange', render);
// Duas janelas abertas (celular + desktop no preview): o que uma salva, a outra mostra
window.addEventListener('storage', () => { if (routeFromHash() === 'caixa') renderView(); });
render();

// Cliques (visual apenas)
const setMore = (open) => {
  app.querySelector('[data-sheet]').hidden = !open;
  app.querySelector('.sheet-backdrop').hidden = !open;
  app.querySelector('[data-more]').setAttribute('aria-expanded', String(open));
};

app.addEventListener('click', (e) => {
  const gatilho = e.target.closest('[data-action]');
  if (gatilho) { acao(gatilho.dataset.action, gatilho); return; }

  if (e.target.closest('[data-more]')) {
    setMore(app.querySelector('[data-sheet]').hidden);
  } else if (e.target.closest('[data-more-close]') || e.target.closest('[data-sheet] a')) {
    setMore(false);
  }

  const check = e.target.closest('.task__check');
  if (check) {
    const done = check.closest('.task').classList.toggle('is-done');
    check.setAttribute('aria-pressed', String(done));
  }

  const toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    const on = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(on));
    toggle.querySelector('.toggle__dot').textContent = on ? '✓' : '○';
    toggle.querySelector('.toggle__text').textContent = on ? 'Treinei hoje' : 'Ainda não treinei';
  }

  if (e.target.closest('[aria-disabled="true"]')) e.preventDefault();
});

app.addEventListener('input', (e) => {
  if (e.target.dataset.field) campo(e.target);
  if (e.target.matches('textarea[data-autosize]')) autoajustar(e.target.parentElement);
});
app.addEventListener('change', (e) => { if (e.target.dataset.change) mudou(e.target); });

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMore(false); });
