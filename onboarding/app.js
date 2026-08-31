/**
 * By Cida Smart Onboarding — MVP
 *
 * Architecture notes:
 * - Config-driven: each onboarding is a JSON file in /config/
 * - Storage: localStorage now, Supabase-ready via OnboardingStore interface
 * - AI-ready: responses stored in structured format for future analysis
 *
 * Future integration point:
 *   OnboardingAnalysis.analyze({ clientContext, responses, existingDocuments })
 *   → { facts, decisions, hypotheses, contradictions, gaps, opportunities, followUpQuestions }
 */

(function () {
  'use strict';

  // === Storage Interface (swap for Supabase later) ===
  const OnboardingStore = {
    _key(slug) {
      return `bycida_onboarding_${slug}`;
    },

    load(slug) {
      try {
        const data = localStorage.getItem(this._key(slug));
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },

    save(slug, session) {
      try {
        session.updatedAt = new Date().toISOString();
        localStorage.setItem(this._key(slug), JSON.stringify(session));
        return true;
      } catch {
        return false;
      }
    },

    createSession(slug, config) {
      const session = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        slug,
        clientName: config.client.fullName,
        status: 'in_progress',
        currentStep: 0, // 0 = welcome
        responses: {},
        startedAt: new Date().toISOString(),
        submittedAt: null,
        updatedAt: new Date().toISOString(),
        meta: {
          onboardingType: config.meta.onboardingType,
          version: config.meta.version
        }
      };
      this.save(slug, session);
      return session;
    },

    submit(slug) {
      const session = this.load(slug);
      if (!session) return null;
      session.status = 'submitted';
      session.submittedAt = new Date().toISOString();
      this.save(slug, session);
      return session;
    }
  };

  // === App State ===
  let config = null;
  let session = null;
  let slug = null;

  // Screens: welcome, step-0..step-N, review, confirmation
  const SCREEN_WELCOME = 'welcome';
  const SCREEN_REVIEW = 'review';
  const SCREEN_CONFIRMATION = 'confirmation';

  function getStepScreen(i) { return `step-${i}`; }
  function isStepScreen(s) { return s.startsWith('step-'); }
  function getStepIndex(s) { return parseInt(s.split('-')[1], 10); }

  // === URL / Slug ===
  function getSlugFromURL() {
    const path = window.location.pathname.replace(/\/$/, '');
    const parts = path.split('/');
    // /onboarding/bruna-makdissi → last segment
    return parts[parts.length - 1] || null;
  }

  // === Config Loading ===
  async function loadConfig(slug) {
    const resp = await fetch(`/onboarding/config/${slug}.json`);
    if (!resp.ok) {
      throw new Error(`Onboarding não encontrado: ${slug}`);
    }
    return resp.json();
  }

  // === Render ===
  const container = document.getElementById('onboarding-app');

  function render(screenId) {
    container.innerHTML = '';
    container.className = 'onboarding-container';

    if (screenId === SCREEN_WELCOME) {
      renderWelcome();
    } else if (isStepScreen(screenId)) {
      renderStep(getStepIndex(screenId));
    } else if (screenId === SCREEN_REVIEW) {
      renderReview();
    } else if (screenId === SCREEN_CONFIRMATION) {
      renderConfirmation();
    }

    // Re-trigger animation
    container.style.animation = 'none';
    container.offsetHeight; // reflow
    container.style.animation = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderWelcome() {
    const w = config.welcome;
    const screen = el('div', 'screen active');

    screen.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        <h1 class="screen__title">${esc(w.title)}</h1>
        <p class="screen__subtitle">${esc(w.description)}</p>
        <div class="nav-buttons nav-buttons--center" style="flex-direction:column;gap:0.75rem;">
          <button class="btn btn--primary" id="btn-start">${esc(w.cta)}</button>
          <span class="welcome-time">${esc(w.estimatedTime)}</span>
        </div>
      </div>
    `;

    container.appendChild(screen);
    document.getElementById('btn-start').addEventListener('click', () => {
      navigate(getStepScreen(0));
    });
  }

  function renderStep(index) {
    const step = config.steps[index];
    const totalSteps = config.steps.length;
    const isLast = index === totalSteps - 1;
    const isFirst = index === 0;
    const savedResponse = session.responses[step.id] || '';

    const screen = el('div', 'screen active');

    // Progress
    const progressPct = ((index + 1) / totalSteps) * 100;

    screen.innerHTML = `
      <div class="progress-label">${index + 1} de ${totalSteps}</div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width:${progressPct}%"></div></div>

      <h2 class="screen__title">${esc(step.title)}</h2>
      <p class="screen__question">"${esc(step.question)}"</p>
      <p class="screen__helper">${esc(step.helperText)}</p>

      <div class="response-mode">
        <button class="response-mode__btn active" type="button">✏️ Prefiro escrever</button>
        <button class="response-mode__btn response-mode__btn--audio" type="button">🎙️ Áudio </button>
      </div>

      <textarea
        class="response-area"
        id="response-input"
        placeholder="Escreva aqui do seu jeito..."
        rows="6"
      >${esc(savedResponse)}</textarea>
      <div class="saved-indicator" id="saved-indicator">✓ Salvo</div>

      <div class="nav-buttons">
        <button class="btn btn--secondary" id="btn-back"${isFirst ? ' style="visibility:hidden"' : ''}>← Voltar</button>
        <button class="btn btn--primary" id="btn-next">${isLast ? 'Revisar' : 'Continuar →'}</button>
      </div>
    `;

    container.appendChild(screen);

    // Autosave
    const textarea = document.getElementById('response-input');
    const indicator = document.getElementById('saved-indicator');
    let saveTimeout = null;

    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        session.responses[step.id] = textarea.value;
        session.currentStep = index + 1;
        OnboardingStore.save(slug, session);
        indicator.classList.add('visible');
        setTimeout(() => indicator.classList.remove('visible'), 1500);
      }, 500);
    });

    textarea.focus();

    // Nav
    document.getElementById('btn-back').addEventListener('click', () => {
      saveCurrentResponse(step.id, textarea);
      navigate(isFirst ? SCREEN_WELCOME : getStepScreen(index - 1));
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      saveCurrentResponse(step.id, textarea);
      if (isLast) {
        navigate(SCREEN_REVIEW);
      } else {
        navigate(getStepScreen(index + 1));
      }
    });
  }

  function saveCurrentResponse(stepId, textarea) {
    session.responses[stepId] = textarea.value;
    OnboardingStore.save(slug, session);
  }

  function renderReview() {
    const screen = el('div', 'screen active');
    const steps = config.steps;

    let cardsHtml = '';
    steps.forEach((step, i) => {
      const response = session.responses[step.id] || '';
      const isEmpty = !response.trim();
      cardsHtml += `
        <div class="review-card">
          <div class="review-card__label">${esc(step.title)}</div>
          <div class="review-card__text${isEmpty ? ' review-card__text--empty' : ''}">
            ${isEmpty ? (step.optional ? 'Nenhuma resposta (opcional)' : 'Sem resposta') : esc(response)}
          </div>
          <button class="review-card__edit" data-step="${i}">${esc(config.review.editLabel)}</button>
        </div>
      `;
    });

    screen.innerHTML = `
      <div class="progress-label">Revisão</div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width:100%"></div></div>

      <h2 class="screen__title">${esc(config.review.title)}</h2>

      ${cardsHtml}

      <div class="nav-buttons">
        <button class="btn btn--secondary" id="btn-back">← Voltar</button>
        <button class="btn btn--primary" id="btn-submit">${esc(config.review.submitLabel)}</button>
      </div>
    `;

    container.appendChild(screen);

    // Edit buttons
    screen.querySelectorAll('.review-card__edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepIndex = parseInt(btn.dataset.step, 10);
        session._returnToReview = true;
        navigate(getStepScreen(stepIndex));
      });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
      navigate(getStepScreen(config.steps.length - 1));
    });

    document.getElementById('btn-submit').addEventListener('click', () => {
      OnboardingStore.submit(slug);
      navigate(SCREEN_CONFIRMATION);
    });
  }

  function renderConfirmation() {
    const c = config.confirmation;
    const screen = el('div', 'screen active');

    screen.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
        <div class="confirmation-icon">💛</div>
        <h1 class="screen__title" style="text-align:center;">${esc(c.title.replace(' 💛', ''))}</h1>
        <p class="screen__subtitle" style="text-align:center;">${esc(c.message)}</p>
      </div>
    `;

    container.appendChild(screen);
  }

  // === Helpers ===
  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function navigate(screenId) {
    render(screenId);
  }

  // === Not Found ===
  function renderNotFound() {
    container.innerHTML = `
      <div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
        <h1 class="screen__title">Onboarding não encontrado</h1>
        <p class="screen__subtitle">Verifique o link que você recebeu.</p>
      </div>
    `;
  }

  // === Init ===
  async function init() {
    slug = getSlugFromURL();
    if (!slug || slug === 'onboarding') {
      renderNotFound();
      return;
    }

    try {
      config = await loadConfig(slug);
    } catch {
      renderNotFound();
      return;
    }

    // Load or create session
    session = OnboardingStore.load(slug);
    if (!session || session.status === 'submitted') {
      if (session && session.status === 'submitted') {
        // Already submitted — show confirmation
        render(SCREEN_CONFIRMATION);
        return;
      }
      session = OnboardingStore.createSession(slug, config);
    }

    // Resume from where they left off
    if (session.currentStep > 0 && session.currentStep <= config.steps.length) {
      render(getStepScreen(session.currentStep - 1));
    } else {
      render(SCREEN_WELCOME);
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
