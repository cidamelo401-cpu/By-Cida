// Despeja! — arranque: monta a casca, troca de tela pelo endereço (#/hoje, #/despeja…)
// e liga os pequenos efeitos visuais. Sem dados reais, sem salvar nada.
import { sidebar, tabbar, moreSheet, icon } from './components.js';
import { SCREENS, TITLES } from './screens.js';

const app = document.getElementById('app');

const routeFromHash = () => {
  const id = location.hash.replace(/^#\/?/, '');
  return SCREENS[id] ? id : 'hoje';
};

function render() {
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
  document.title = `${TITLES[route]} · Despeja!`;
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();

// Cliques (visual apenas)
const setMore = (open) => {
  app.querySelector('[data-sheet]').hidden = !open;
  app.querySelector('.sheet-backdrop').hidden = !open;
  app.querySelector('[data-more]').setAttribute('aria-expanded', String(open));
};

app.addEventListener('click', (e) => {
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

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMore(false); });
