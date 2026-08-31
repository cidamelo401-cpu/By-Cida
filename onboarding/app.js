/**
 * By Cida Smart Onboarding — Phase 2
 *
 * - Supabase persistence (primary) + localStorage (recovery)
 * - Audio recording with private storage
 * - LGPD consent gate
 * - Offline resilience with sync queue
 *
 * Future: AI analysis pipeline
 *   { clientContext, responses, existingDocuments }
 *   → { facts, decisions, hypotheses, contradictions, gaps, opportunities, followUpQuestions }
 */

(function () {
  'use strict';

  // === Supabase Config ===
  const SUPABASE_URL = 'https://pnylyuhnrphpksekfmbh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueWx5dWhucnBocGtzZWtmbWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mjc0OTIsImV4cCI6MjEwMjQwMzQ5Mn0.LioVn_rV3B01Gee_JDJyD1FrEkV4W1iUzmYiEniG66I';

  // === Lightweight Supabase Client (no SDK dependency) ===
  const supabase = {
    async query(table, { method = 'GET', filters = '', body = null, single = false, headers = {} } = {}) {
      const url = `${SUPABASE_URL}/rest/v1/${table}${filters ? '?' + filters : ''}`;
      const opts = {
        method,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': method === 'POST' ? 'return=representation' : (method === 'PATCH' ? 'return=representation' : ''),
          ...headers,
        },
      };
      if (body) opts.body = JSON.stringify(body);
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Supabase ${method} ${table}: ${resp.status} ${text}`);
      }
      if (resp.status === 204) return null;
      const data = await resp.json();
      return single ? (Array.isArray(data) ? data[0] || null : data) : data;
    },

    async uploadAudio(path, blob) {
      const url = `${SUPABASE_URL}/storage/v1/object/onboarding-audio/${path}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': blob.type || 'audio/webm',
        },
        body: blob,
      });
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      return path;
    },

    getAudioUrl(path) {
      // Signed URL not needed for playback within same session — use authenticated fetch
      return `${SUPABASE_URL}/storage/v1/object/authenticated/onboarding-audio/${path}`;
    },

    async fetchAudioBlob(path) {
      const url = `${SUPABASE_URL}/storage/v1/object/onboarding-audio/${path}`;
      const resp = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!resp.ok) return null;
      return resp.blob();
    }
  };

  // === Local Storage (recovery layer) ===
  const LocalStore = {
    _key(slug) { return `bycida_onboarding_${slug}`; },
    load(slug) { try { return JSON.parse(localStorage.getItem(this._key(slug))); } catch { return null; } },
    save(slug, data) { try { localStorage.setItem(this._key(slug), JSON.stringify(data)); } catch {} },
    clear(slug) { try { localStorage.removeItem(this._key(slug)); } catch {} },
  };

  // === Sync Queue (offline resilience) ===
  const SyncQueue = {
    _queue: [],
    _processing: false,

    add(fn) {
      this._queue.push(fn);
      this._process();
    },

    async _process() {
      if (this._processing) return;
      this._processing = true;
      while (this._queue.length > 0) {
        const fn = this._queue[0];
        try {
          await fn();
          this._queue.shift();
        } catch (e) {
          console.warn('Sync failed, will retry:', e.message);
          // Wait and retry
          await new Promise(r => setTimeout(r, 3000));
        }
      }
      this._processing = false;
    }
  };

  // === App State ===
  let config = null;
  let session = null;  // local session state
  let dbSession = null; // Supabase session row
  let slug = null;
  let clientRecord = null;
  let audioRecordings = {}; // stepId → { blob, path, uploaded }

  const SCREEN_WELCOME = 'welcome';
  const SCREEN_CONSENT = 'consent';
  const SCREEN_REVIEW = 'review';
  const SCREEN_CONFIRMATION = 'confirmation';

  function getStepScreen(i) { return `step-${i}`; }
  function isStepScreen(s) { return s && s.startsWith('step-'); }
  function getStepIndex(s) { return parseInt(s.split('-')[1], 10); }

  function getSlugFromURL() {
    const path = window.location.pathname.replace(/\/$/, '');
    const parts = path.split('/');
    return parts[parts.length - 1] || null;
  }

  async function loadConfig(slug) {
    const resp = await fetch(`/onboarding/config/${slug}.json`);
    if (!resp.ok) throw new Error('not found');
    return resp.json();
  }

  // === Supabase Session Management ===
  const TOKEN_KEY = 'bycida_session_token';

  function getStoredToken(slug) {
    try { return localStorage.getItem(`${TOKEN_KEY}_${slug}`); } catch { return null; }
  }

  function storeToken(slug, token) {
    try { localStorage.setItem(`${TOKEN_KEY}_${slug}`, token); } catch {}
  }

  async function findOrCreateSession(slug, clientId) {
    const token = getStoredToken(slug);

    // Try to resume existing session
    if (token) {
      try {
        const existing = await supabase.query('onboarding_sessions', {
          filters: `browser_token=eq.${token}&select=*`,
          single: true,
        });
        if (existing) {
          dbSession = existing;
          // Load responses
          const responses = await supabase.query('onboarding_responses', {
            filters: `session_id=eq.${existing.id}&select=*`,
          });
          const respMap = {};
          const audioMap = {};
          (responses || []).forEach(r => {
            respMap[r.step_id] = r.text_response || '';
            if (r.audio_path) {
              audioMap[r.step_id] = { blob: null, path: r.audio_path, uploaded: true };
            }
          });
          audioRecordings = audioMap;
          return {
            id: existing.id,
            slug,
            status: existing.status,
            currentStep: existing.current_step || 0,
            responses: respMap,
            consentAccepted: !!existing.consent_accepted_at,
            startedAt: existing.started_at,
            submittedAt: existing.submitted_at,
          };
        }
      } catch (e) {
        console.warn('Failed to resume session:', e.message);
      }
    }

    // Create new session
    try {
      const newSession = await supabase.query('onboarding_sessions', {
        method: 'POST',
        body: {
          client_id: clientId,
          onboarding_type: config.meta.onboardingType,
          status: 'in_progress',
          current_step: 0,
        },
        single: true,
      });
      dbSession = newSession;
      storeToken(slug, newSession.browser_token);
      return {
        id: newSession.id,
        slug,
        status: 'in_progress',
        currentStep: 0,
        responses: {},
        consentAccepted: false,
        startedAt: newSession.started_at,
        submittedAt: null,
      };
    } catch (e) {
      console.warn('Failed to create remote session:', e.message);
      // Fallback to local-only
      return {
        id: 'local-' + Date.now(),
        slug,
        status: 'in_progress',
        currentStep: 0,
        responses: {},
        consentAccepted: false,
        startedAt: new Date().toISOString(),
        submittedAt: null,
        _localOnly: true,
      };
    }
  }

  async function saveResponseRemote(stepId, textResponse, audioPath) {
    if (!dbSession) return;
    try {
      // Upsert response
      await supabase.query('onboarding_responses', {
        method: 'POST',
        body: {
          session_id: dbSession.id,
          step_id: stepId,
          text_response: textResponse || null,
          audio_path: audioPath || null,
          updated_at: new Date().toISOString(),
        },
        headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      });
    } catch (e) {
      console.warn('Remote save failed:', e.message);
    }
  }

  async function updateSessionStep(step) {
    if (!dbSession) return;
    try {
      await supabase.query('onboarding_sessions', {
        method: 'PATCH',
        filters: `id=eq.${dbSession.id}`,
        body: { current_step: step, updated_at: new Date().toISOString() },
      });
    } catch {}
  }

  async function acceptConsentRemote() {
    if (!dbSession) return;
    try {
      await supabase.query('onboarding_sessions', {
        method: 'PATCH',
        filters: `id=eq.${dbSession.id}`,
        body: { consent_accepted_at: new Date().toISOString() },
      });
    } catch {}
  }

  async function submitRemote() {
    if (!dbSession) return false;
    try {
      // Sync all pending local responses first
      for (const stepId of Object.keys(session.responses)) {
        const audioPath = audioRecordings[stepId]?.path || null;
        await saveResponseRemote(stepId, session.responses[stepId], audioPath);
      }
      await supabase.query('onboarding_sessions', {
        method: 'PATCH',
        filters: `id=eq.${dbSession.id}`,
        body: { status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      });
      return true;
    } catch (e) {
      console.error('Submit failed:', e.message);
      return false;
    }
  }

  // === Audio Recording ===
  const AudioRecorder = {
    mediaRecorder: null,
    chunks: [],
    stream: null,
    startTime: null,
    timerInterval: null,

    async checkSupport() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    },

    async requestPermission() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } catch {
        return false;
      }
    },

    start(onTick) {
      if (!this.stream) return false;
      this.chunks = [];
      // Prefer webm, fall back to what's available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
        : '';
      const opts = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, opts);
      this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.mediaRecorder.start(250);
      this.startTime = Date.now();
      if (onTick) {
        this.timerInterval = setInterval(onTick, 500);
      }
      return true;
    },

    stop() {
      return new Promise((resolve) => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          resolve(null);
          return;
        }
        clearInterval(this.timerInterval);
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
          resolve(blob);
        };
        this.mediaRecorder.stop();
      });
    },

    getElapsed() {
      if (!this.startTime) return '0:00';
      const sec = Math.floor((Date.now() - this.startTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },

    releaseStream() {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
    }
  };

  async function uploadAudioFile(sessionId, stepId, blob) {
    const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    const path = `${sessionId}/${stepId}.${ext}`;
    await supabase.uploadAudio(path, blob);
    // Register in files table
    try {
      await supabase.query('onboarding_files', {
        method: 'POST',
        body: {
          session_id: sessionId,
          file_type: 'audio',
          storage_path: path,
          original_name: `${stepId}.${ext}`,
          mime_type: blob.type || `audio/${ext}`,
          size_bytes: blob.size,
        },
      });
    } catch {}
    return path;
  }

  // === Render Engine ===
  const container = document.getElementById('onboarding-app');

  function render(screenId) {
    // Cleanup audio if navigating away
    AudioRecorder.releaseStream();
    clearInterval(AudioRecorder.timerInterval);

    container.innerHTML = '';
    container.className = 'onboarding-container';

    if (screenId === SCREEN_WELCOME) renderWelcome();
    else if (screenId === SCREEN_CONSENT) renderConsent();
    else if (isStepScreen(screenId)) renderStep(getStepIndex(screenId));
    else if (screenId === SCREEN_REVIEW) renderReview();
    else if (screenId === SCREEN_CONFIRMATION) renderConfirmation();

    container.style.animation = 'none';
    container.offsetHeight;
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
      if (session.consentAccepted) {
        navigate(getStepScreen(0));
      } else {
        navigate(SCREEN_CONSENT);
      }
    });
  }

  function renderConsent() {
    const screen = el('div', 'screen active');
    screen.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        <h2 class="screen__title">Antes de começarmos</h2>
        <p class="screen__subtitle" style="margin-bottom:1.5rem;">
          Suas respostas serão usadas pela By Cida para entender seu negócio e preparar seu diagnóstico e estratégia.
          \n\nVocê pode responder por texto ou áudio. Ao continuar, você concorda com o tratamento dessas informações para esta finalidade.
        </p>
        <label class="consent-label" id="consent-label">
          <input type="checkbox" id="consent-checkbox">
          <span>Li e concordo.</span>
        </label>
        <div class="nav-buttons nav-buttons--center" style="margin-top:2rem;">
          <button class="btn btn--primary" id="btn-consent" disabled>Continuar</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    const checkbox = document.getElementById('consent-checkbox');
    const btn = document.getElementById('btn-consent');

    checkbox.addEventListener('change', () => {
      btn.disabled = !checkbox.checked;
    });

    btn.addEventListener('click', async () => {
      session.consentAccepted = true;
      LocalStore.save(slug, session);
      await acceptConsentRemote();
      navigate(getStepScreen(0));
    });
  }

  function renderStep(index) {
    const step = config.steps[index];
    const totalSteps = config.steps.length;
    const isLast = index === totalSteps - 1;
    const isFirst = index === 0;
    const savedResponse = session.responses[step.id] || '';
    const hasAudio = !!audioRecordings[step.id];
    const progressPct = ((index + 1) / totalSteps) * 100;

    const screen = el('div', 'screen active');
    screen.innerHTML = `
      <div class="progress-label">${index + 1} de ${totalSteps}</div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width:${progressPct}%"></div></div>

      <h2 class="screen__title">${esc(step.title)}</h2>
      <p class="screen__question">"${esc(step.question)}"</p>
      <p class="screen__helper">${esc(step.helperText)}</p>

      <div class="response-mode">
        <button class="response-mode__btn ${!hasAudio ? 'active' : ''}" id="mode-text" type="button">✏️ Prefiro escrever</button>
        <button class="response-mode__btn ${hasAudio ? 'active' : ''}" id="mode-audio" type="button">🎙️ Responder por áudio</button>
      </div>

      <div id="text-area-container" ${hasAudio ? 'hidden' : ''}>
        <textarea
          class="response-area"
          id="response-input"
          placeholder="Escreva aqui do seu jeito..."
          rows="6"
        >${esc(savedResponse)}</textarea>
        <div class="saved-indicator" id="saved-indicator">✓ Salvo</div>
      </div>

      <div id="audio-area-container" ${!hasAudio ? 'hidden' : ''}>
        <div id="audio-ui"></div>
      </div>

      <div class="nav-buttons">
        <button class="btn btn--secondary" id="btn-back"${isFirst ? ' style="visibility:hidden"' : ''}>← Voltar</button>
        <button class="btn btn--primary" id="btn-next">${isLast ? 'Revisar' : 'Continuar →'}</button>
      </div>
    `;
    container.appendChild(screen);

    // Mode toggle
    const modeText = document.getElementById('mode-text');
    const modeAudio = document.getElementById('mode-audio');
    const textContainer = document.getElementById('text-area-container');
    const audioContainer = document.getElementById('audio-area-container');

    modeText.addEventListener('click', () => {
      modeText.classList.add('active');
      modeAudio.classList.remove('active');
      textContainer.hidden = false;
      audioContainer.hidden = true;
      const ta = document.getElementById('response-input');
      if (ta) ta.focus();
    });

    modeAudio.addEventListener('click', async () => {
      modeAudio.classList.add('active');
      modeText.classList.remove('active');
      textContainer.hidden = true;
      audioContainer.hidden = false;
      await setupAudioUI(step.id);
    });

    // If has audio already, render playback
    if (hasAudio) {
      renderAudioPlayback(step.id);
    }

    // Autosave text
    const textarea = document.getElementById('response-input');
    const indicator = document.getElementById('saved-indicator');
    let saveTimeout = null;

    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        session.responses[step.id] = textarea.value;
        session.currentStep = index + 1;
        LocalStore.save(slug, session);
        // Remote sync (queued)
        SyncQueue.add(() => saveResponseRemote(step.id, textarea.value, audioRecordings[step.id]?.path));
        SyncQueue.add(() => updateSessionStep(index + 1));
        showSaved(indicator);
      }, 600);
    });

    if (!hasAudio) textarea.focus();

    // Nav
    document.getElementById('btn-back').addEventListener('click', () => {
      flushStep(step.id, index);
      navigate(isFirst ? SCREEN_WELCOME : getStepScreen(index - 1));
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      flushStep(step.id, index);
      navigate(isLast ? SCREEN_REVIEW : getStepScreen(index + 1));
    });
  }

  function flushStep(stepId, index) {
    const ta = document.getElementById('response-input');
    if (ta) {
      session.responses[stepId] = ta.value;
    }
    session.currentStep = index + 1;
    LocalStore.save(slug, session);
    SyncQueue.add(() => saveResponseRemote(stepId, session.responses[stepId], audioRecordings[stepId]?.path));
    SyncQueue.add(() => updateSessionStep(index + 1));
  }

  async function setupAudioUI(stepId) {
    const audioUI = document.getElementById('audio-ui');

    if (audioRecordings[stepId]) {
      renderAudioPlayback(stepId);
      return;
    }

    const supported = await AudioRecorder.checkSupport();
    if (!supported) {
      audioUI.innerHTML = `
        <div class="audio-fallback">
          <p>Seu navegador não suporta gravação de áudio.</p>
          <button class="btn btn--secondary" id="audio-fallback-text">Responder por texto</button>
        </div>
      `;
      document.getElementById('audio-fallback-text').addEventListener('click', () => {
        document.getElementById('mode-text').click();
      });
      return;
    }

    audioUI.innerHTML = `
      <div class="audio-recorder">
        <button class="audio-record-btn" id="btn-record">
          <span class="audio-record-icon">🎙️</span>
          <span>Toque para gravar</span>
        </button>
      </div>
    `;

    document.getElementById('btn-record').addEventListener('click', async () => {
      const permitted = await AudioRecorder.requestPermission();
      if (!permitted) {
        audioUI.innerHTML = `
          <div class="audio-fallback">
            <p>Não foi possível acessar o microfone. Verifique as permissões do navegador.</p>
            <button class="btn btn--secondary" id="audio-fallback-text">Responder por texto</button>
          </div>
        `;
        document.getElementById('audio-fallback-text').addEventListener('click', () => {
          document.getElementById('mode-text').click();
        });
        return;
      }

      renderRecording(stepId);
    });
  }

  function renderRecording(stepId) {
    const audioUI = document.getElementById('audio-ui');
    audioUI.innerHTML = `
      <div class="audio-recording">
        <div class="audio-recording__pulse"></div>
        <div class="audio-recording__timer" id="rec-timer">0:00</div>
        <p class="audio-recording__label">Gravando...</p>
        <button class="audio-stop-btn" id="btn-stop">⏹ Parar gravação</button>
      </div>
    `;

    const timer = document.getElementById('rec-timer');
    AudioRecorder.start(() => { timer.textContent = AudioRecorder.getElapsed(); });

    document.getElementById('btn-stop').addEventListener('click', async () => {
      const blob = await AudioRecorder.stop();
      AudioRecorder.releaseStream();
      if (blob && blob.size > 0) {
        audioRecordings[stepId] = { blob, path: null, uploaded: false };
        renderAudioPreview(stepId, blob);
      }
    });
  }

  function renderAudioPreview(stepId, blob) {
    const audioUI = document.getElementById('audio-ui');
    const url = URL.createObjectURL(blob);
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);

    audioUI.innerHTML = `
      <div class="audio-preview">
        <audio controls src="${url}" id="audio-preview-player"></audio>
        <p class="audio-preview__info">${sizeMB} MB</p>
        <div class="audio-preview__actions">
          <button class="btn btn--secondary" id="btn-audio-redo">🗑️ Gravar novamente</button>
          <button class="btn btn--primary" id="btn-audio-confirm">✓ Usar esta gravação</button>
        </div>
      </div>
    `;

    document.getElementById('btn-audio-redo').addEventListener('click', () => {
      URL.revokeObjectURL(url);
      delete audioRecordings[stepId];
      setupAudioUI(stepId);
    });

    document.getElementById('btn-audio-confirm').addEventListener('click', async () => {
      const confirmBtn = document.getElementById('btn-audio-confirm');
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Enviando...';

      try {
        const path = await uploadAudioFile(dbSession.id, stepId, blob);
        audioRecordings[stepId] = { blob, path, uploaded: true };
        await saveResponseRemote(stepId, session.responses[stepId], path);
        LocalStore.save(slug, session);
        renderAudioPlayback(stepId);
      } catch (e) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✓ Usar esta gravação';
        // Keep locally, queue for later
        console.warn('Audio upload failed:', e.message);
        audioUI.insertAdjacentHTML('beforeend',
          '<p class="audio-error">Falha no envio. Tente novamente ou continue por texto.</p>');
      }
    });
  }

  function renderAudioPlayback(stepId) {
    const audioUI = document.getElementById('audio-ui');
    if (!audioUI) return;
    const rec = audioRecordings[stepId];
    if (!rec) return;

    let audioSrc = '';
    if (rec.blob) {
      audioSrc = URL.createObjectURL(rec.blob);
    }

    audioUI.innerHTML = `
      <div class="audio-preview audio-preview--confirmed">
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : '<p class="audio-preview__info">🎙️ Áudio gravado</p>'}
        <p class="audio-preview__status">✓ Áudio salvo</p>
        <button class="btn btn--secondary" id="btn-audio-replace">Gravar novamente</button>
      </div>
    `;

    document.getElementById('btn-audio-replace').addEventListener('click', () => {
      delete audioRecordings[stepId];
      setupAudioUI(stepId);
    });
  }

  function renderReview() {
    const screen = el('div', 'screen active');
    const steps = config.steps;

    let cardsHtml = '';
    steps.forEach((step, i) => {
      const response = session.responses[step.id] || '';
      const hasAudio = !!audioRecordings[step.id];
      const isEmpty = !response.trim() && !hasAudio;

      let contentHtml;
      if (hasAudio && response.trim()) {
        contentHtml = `<span>${esc(response)}</span><br><span class="review-card__audio">🎙️ Áudio gravado</span>`;
      } else if (hasAudio) {
        contentHtml = `<span class="review-card__audio">🎙️ Áudio gravado</span>`;
      } else if (response.trim()) {
        contentHtml = esc(response);
      } else {
        contentHtml = step.optional ? 'Nenhuma resposta (opcional)' : 'Sem resposta';
      }

      cardsHtml += `
        <div class="review-card">
          <div class="review-card__label">${esc(step.title)}</div>
          <div class="review-card__text${isEmpty && !step.optional ? ' review-card__text--empty' : ''}">
            ${contentHtml}
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
      <div id="submit-error" hidden></div>
      <div class="nav-buttons">
        <button class="btn btn--secondary" id="btn-back">← Voltar</button>
        <button class="btn btn--primary" id="btn-submit">${esc(config.review.submitLabel)}</button>
      </div>
    `;
    container.appendChild(screen);

    screen.querySelectorAll('.review-card__edit').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate(getStepScreen(parseInt(btn.dataset.step, 10)));
      });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
      navigate(getStepScreen(config.steps.length - 1));
    });

    document.getElementById('btn-submit').addEventListener('click', async () => {
      const submitBtn = document.getElementById('btn-submit');
      const errorEl = document.getElementById('submit-error');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      errorEl.hidden = true;

      const success = await submitRemote();
      if (success) {
        session.status = 'submitted';
        session.submittedAt = new Date().toISOString();
        LocalStore.save(slug, session);
        navigate(SCREEN_CONFIRMATION);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = config.review.submitLabel;
        errorEl.hidden = false;
        errorEl.innerHTML = '<p class="submit-error-text">Não foi possível enviar. Verifique sua conexão e tente novamente.</p>';
      }
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

  function renderNotFound() {
    container.innerHTML = `
      <div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
        <h1 class="screen__title">Onboarding não encontrado</h1>
        <p class="screen__subtitle">Verifique o link que você recebeu.</p>
      </div>
    `;
  }

  function renderLoading() {
    container.innerHTML = `
      <div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
        <p class="screen__subtitle">Carregando...</p>
      </div>
    `;
  }

  // === Helpers ===
  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function navigate(screenId) { render(screenId); }

  function showSaved(indicator) {
    indicator.classList.add('visible');
    setTimeout(() => indicator.classList.remove('visible'), 1500);
  }

  // === Init ===
  async function init() {
    slug = getSlugFromURL();
    if (!slug || slug === 'onboarding') { renderNotFound(); return; }

    renderLoading();

    try {
      config = await loadConfig(slug);
    } catch { renderNotFound(); return; }

    // Resolve client
    try {
      clientRecord = await supabase.query('onboarding_clients', {
        filters: `slug=eq.${slug}&select=*`,
        single: true,
      });
    } catch {}

    if (!clientRecord) { renderNotFound(); return; }

    // Find or create session
    session = await findOrCreateSession(slug, clientRecord.id);
    LocalStore.save(slug, session);

    // Route to correct screen
    if (session.status === 'submitted') {
      render(SCREEN_CONFIRMATION);
    } else if (session.currentStep > 0 && session.consentAccepted) {
      render(getStepScreen(Math.min(session.currentStep, config.steps.length) - 1));
    } else {
      render(SCREEN_WELCOME);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
