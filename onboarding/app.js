/**
 * By Cida Smart Onboarding — Phase 2 (Secured)
 *
 * Auth: Supabase Anonymous Authentication
 * Storage: Supabase (primary) + localStorage (offline recovery)
 * Audio: MediaRecorder → private bucket scoped by auth.uid()
 * RLS: all data scoped to auth.uid() via PostgreSQL policies
 *
 * Future: AI analysis pipeline
 *   { clientContext, responses, existingDocuments }
 *   → { facts, decisions, hypotheses, contradictions, gaps, opportunities, followUpQuestions }
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://nttolzutbhynrrprqirj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dG9senV0Ymh5bnJycHJxaXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODc1NTIsImV4cCI6MjEwMzc2MzU1Mn0.vxAu7WwDk2KjIIOBASXH5Cu4aPD8DeyydmulEBDv3fk';

  // Set to true for structured console logs; false silences them.
  const DEBUG = true;

  // ============================================================
  // Structured Logger
  // ============================================================
  const Log = {
    _t: null,
    start(op) { this._t = performance.now(); if (DEBUG) console.log(`[bycida] ▶ ${op}`); },
    ok(op, detail) {
      if (!DEBUG) return;
      const ms = this._t ? Math.round(performance.now() - this._t) : '?';
      console.log(`[bycida] ✅ ${op} — ${ms}ms`, detail || '');
    },
    fail(op, status, message) {
      // Always log errors regardless of DEBUG
      const ms = this._t ? Math.round(performance.now() - this._t) : '?';
      console.error(`[bycida] ❌ ${op} — ${ms}ms | HTTP ${status || '?'} | ${message || ''}`);
    },
    info(op, detail) { if (DEBUG) console.log(`[bycida] ℹ ${op}`, detail || ''); },
  };

  // ============================================================
  // Auth — Supabase Anonymous Authentication
  // ============================================================
  const Auth = {
    _accessToken: null,
    _refreshToken: null,
    _uid: null,
    _refreshTimer: null,
    STORAGE_KEY: 'bycida_auth',

    uid() { return this._uid; },
    token() { return this._accessToken; },

    _persist() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          accessToken: this._accessToken,
          refreshToken: this._refreshToken,
          uid: this._uid,
        }));
      } catch {}
    },

    _restore() {
      try {
        const d = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        if (d && d.accessToken && d.refreshToken && d.uid) {
          this._accessToken = d.accessToken;
          this._refreshToken = d.refreshToken;
          this._uid = d.uid;
          return true;
        }
      } catch {}
      return false;
    },

    async _authFetch(path, body) {
      const resp = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Auth ${path}: ${resp.status} ${text}`);
      }
      return resp.json();
    },

    _setFromResponse(data) {
      this._accessToken = data.access_token;
      this._refreshToken = data.refresh_token;
      this._uid = data.user?.id || this._uid;
      this._persist();
      this._scheduleRefresh(data.expires_in || 3600);
    },

    _scheduleRefresh(expiresIn) {
      clearTimeout(this._refreshTimer);
      // Refresh 60s before expiry
      const ms = Math.max((expiresIn - 60) * 1000, 30000);
      this._refreshTimer = setTimeout(() => this.refresh(), ms);
    },

    async signInAnonymously() {
      Log.start('auth:signInAnonymously');
      const data = await this._authFetch('signup', {});
      this._setFromResponse(data);
      Log.ok('auth:signInAnonymously', { uid: this._uid });
      return this._uid;
    },

    async refresh() {
      if (!this._refreshToken) return false;
      Log.start('auth:refresh');
      try {
        const data = await this._authFetch('token?grant_type=refresh_token', {
          refresh_token: this._refreshToken,
        });
        this._setFromResponse(data);
        Log.ok('auth:refresh', { uid: this._uid, expiresIn: data.expires_in });
        return true;
      } catch (e) {
        Log.fail('auth:refresh', null, e.message);
        return false;
      }
    },

    async init() {
      // Try to restore existing session
      if (this._restore()) {
        const refreshed = await this.refresh();
        if (refreshed) return this._uid;
      }
      // Create new anonymous identity
      return this.signInAnonymously();
    }
  };

  // ============================================================
  // Supabase REST Client (authenticated)
  // ============================================================
  const db = {
    async query(table, { method = 'GET', filters = '', body = null, single = false, headers = {} } = {}) {
      const opName = `db:${method} ${table}`;
      Log.start(opName);
      const url = `${SUPABASE_URL}/rest/v1/${table}${filters ? '?' + filters : ''}`;
      const opts = {
        method,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${Auth.token()}`,
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      if (method === 'POST') opts.headers['Prefer'] = opts.headers['Prefer'] || 'return=representation';
      if (method === 'PATCH') opts.headers['Prefer'] = 'return=representation';
      if (body) opts.body = JSON.stringify(body);
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        Log.fail(opName, resp.status, text);
        throw new Error(`DB ${method} ${table}: ${resp.status} ${text}`);
      }
      if (resp.status === 204) { Log.ok(opName, { status: 204 }); return null; }
      const data = await resp.json();
      Log.ok(opName, { status: resp.status, rows: Array.isArray(data) ? data.length : 1 });
      return single ? (Array.isArray(data) ? data[0] || null : data) : data;
    },

    async uploadAudio(path, blob) {
      Log.start('storage:upload');
      const url = `${SUPABASE_URL}/storage/v1/object/onboarding-audio/${path}`;
      // Strip codec params from MIME type — Safari produces e.g.
      // "audio/mp4;codecs=mp4a.40.2" but Supabase Storage's
      // allowed_mime_types checks the base type only ("audio/mp4").
      const baseType = (blob.type || 'audio/webm').split(';')[0].trim();
      Log.info('storage:upload', { path, mimeRaw: blob.type, mimeBase: baseType, size: blob.size });
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${Auth.token()}`,
          'Content-Type': baseType,
        },
        body: blob,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        Log.fail('storage:upload', resp.status, text);
        throw new Error(`Upload failed: ${resp.status} ${text}`);
      }
      Log.ok('storage:upload', { status: resp.status, path });
      return path;
    },

    async fetchAudioBlob(path) {
      const url = `${SUPABASE_URL}/storage/v1/object/onboarding-audio/${path}`;
      const resp = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${Auth.token()}`,
        },
      });
      if (!resp.ok) return null;
      return resp.blob();
    }
  };

  // ============================================================
  // Local Storage (offline recovery only — never for identity)
  // ============================================================
  const LocalStore = {
    _key(slug) { return `bycida_onboarding_${slug}`; },
    load(slug) { try { return JSON.parse(localStorage.getItem(this._key(slug))); } catch { return null; } },
    save(slug, data) { try { localStorage.setItem(this._key(slug), JSON.stringify(data)); } catch {} },
  };

  // ============================================================
  // Sync Queue (offline resilience)
  // ============================================================
  const SyncQueue = {
    _queue: [],
    _processing: false,
    add(fn) { this._queue.push(fn); this._process(); },
    async _process() {
      if (this._processing) return;
      this._processing = true;
      while (this._queue.length > 0) {
        try { await this._queue[0](); this._queue.shift(); }
        catch (e) { console.warn('Sync retry:', e.message); await new Promise(r => setTimeout(r, 3000)); }
      }
      this._processing = false;
    }
  };

  // ============================================================
  // App State
  // ============================================================
  let config = null;
  let session = null;
  let dbSession = null;
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

  // ============================================================
  // Session Management (Supabase-backed, auth.uid()-scoped)
  // ============================================================

  async function findOrCreateSession(slug, clientId) {
    const uid = Auth.uid();
    Log.start('session:findOrCreate');

    // Try to find existing session for this user + client
    try {
      const existing = await db.query('onboarding_sessions', {
        filters: `anon_user_id=eq.${uid}&client_id=eq.${clientId}&select=*`,
        single: true,
      });
      if (existing) {
        Log.ok('session:findOrCreate', { action: 'restored', id: existing.id });
        dbSession = existing;
        const responses = await db.query('onboarding_responses', {
          filters: `session_id=eq.${existing.id}&select=*`,
        });
        const respMap = {};
        (responses || []).forEach(r => {
          respMap[r.step_id] = r.text_response || '';
          if (r.audio_path) {
            audioRecordings[r.step_id] = { blob: null, path: r.audio_path, uploaded: true };
          }
        });
        return {
          id: existing.id, slug, status: existing.status,
          currentStep: existing.current_step || 0,
          responses: respMap,
          consentAccepted: !!existing.consent_accepted_at,
        };
      }
    } catch (e) { Log.fail('session:findOrCreate', null, 'lookup: ' + e.message); }

    // Create new
    try {
      Log.start('session:create');
      const newSession = await db.query('onboarding_sessions', {
        method: 'POST',
        body: {
          client_id: clientId,
          anon_user_id: uid,
          onboarding_type: config.meta.onboardingType,
          status: 'in_progress',
          current_step: 0,
        },
        single: true,
      });
      dbSession = newSession;
      Log.ok('session:create', { id: newSession.id });
      return {
        id: newSession.id, slug, status: 'in_progress',
        currentStep: 0, responses: {}, consentAccepted: false,
      };
    } catch (e) {
      Log.fail('session:create', null, e.message);
      return null;
    }
  }

  async function saveResponseRemote(stepId, textResponse, audioPath) {
    if (!dbSession) return;
    await db.query('onboarding_responses', {
      method: 'POST',
      // on_conflict tells PostgREST which unique constraint to use for UPSERT
      // (table has both PK on id and UNIQUE on session_id+step_id)
      filters: 'on_conflict=session_id,step_id',
      body: {
        session_id: dbSession.id,
        step_id: stepId,
        text_response: textResponse || null,
        audio_path: audioPath || null,
        updated_at: new Date().toISOString(),
      },
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    });
  }

  async function updateSessionStep(step) {
    if (!dbSession) return;
    await db.query('onboarding_sessions', {
      method: 'PATCH',
      filters: `id=eq.${dbSession.id}`,
      body: { current_step: step, updated_at: new Date().toISOString() },
    });
  }

  async function acceptConsentRemote() {
    if (!dbSession) return;
    await db.query('onboarding_sessions', {
      method: 'PATCH',
      filters: `id=eq.${dbSession.id}`,
      body: { consent_accepted_at: new Date().toISOString() },
    });
  }

  async function submitRemote() {
    if (!dbSession) return false;
    Log.start('submit');
    try {
      // Refresh JWT before submit — Safari/iOS may have suspended the
      // refresh timer if the tab was inactive or the device slept.
      await Auth.refresh().catch(() => {});

      const stepIds = Object.keys(session.responses);
      Log.info('submit', `saving ${stepIds.length} responses`);
      for (const stepId of stepIds) {
        const audioPath = audioRecordings[stepId]?.path || null;
        await saveResponseRemote(stepId, session.responses[stepId], audioPath);
      }
      await db.query('onboarding_sessions', {
        method: 'PATCH',
        filters: `id=eq.${dbSession.id}`,
        body: { status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      });
      Log.ok('submit', { session: dbSession.id, steps: stepIds.length });
      return true;
    } catch (e) { Log.fail('submit', null, e.message); throw e; }
  }

  // ============================================================
  // Audio Recording
  // ============================================================
  const AudioRecorder = {
    mediaRecorder: null, chunks: [], stream: null,
    startTime: null, timerInterval: null,

    async checkSupport() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    },

    async requestPermission() {
      try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); return true; }
      catch { return false; }
    },

    start(onTick) {
      if (!this.stream) return false;
      this.chunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : {});
      this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.mediaRecorder.start(250);
      this.startTime = Date.now();
      if (onTick) this.timerInterval = setInterval(onTick, 500);
      return true;
    },

    stop() {
      return new Promise((resolve) => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') { resolve(null); return; }
        clearInterval(this.timerInterval);
        this.mediaRecorder.onstop = () => {
          resolve(new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'audio/webm' }));
        };
        this.mediaRecorder.stop();
      });
    },

    getElapsed() {
      if (!this.startTime) return '0:00';
      const sec = Math.floor((Date.now() - this.startTime) / 1000);
      return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
    },

    releaseStream() {
      if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    }
  };

  async function uploadAudioFile(sessionId, stepId, blob) {
    Log.start('audio:upload');
    // Refresh JWT in case Safari/iOS suspended the refresh timer
    await Auth.refresh().catch(() => {});
    const uid = Auth.uid();
    const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    // Path scoped by auth.uid() for RLS
    const path = `${uid}/${sessionId}/${stepId}.${ext}`;
    Log.info('audio:upload', { path, mime: blob.type, size: blob.size });
    await db.uploadAudio(path, blob);
    try {
      await db.query('onboarding_files', {
        method: 'POST',
        body: {
          session_id: sessionId, file_type: 'audio', storage_path: path,
          original_name: `${stepId}.${ext}`, mime_type: blob.type || `audio/${ext}`, size_bytes: blob.size,
        },
      });
    } catch {}
    Log.ok('audio:upload', { path });
    return path;
  }

  // ============================================================
  // Render Engine
  // ============================================================
  const container = document.getElementById('onboarding-app');

  function render(screenId) {
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
      </div>`;
    container.appendChild(screen);
    document.getElementById('btn-start').addEventListener('click', () => {
      navigate(session.consentAccepted ? getStepScreen(0) : SCREEN_CONSENT);
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
      </div>`;
    container.appendChild(screen);
    const cb = document.getElementById('consent-checkbox');
    const btn = document.getElementById('btn-consent');
    cb.addEventListener('change', () => { btn.disabled = !cb.checked; });
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
        <textarea class="response-area" id="response-input" placeholder="Escreva aqui do seu jeito..." rows="6">${esc(savedResponse)}</textarea>
        <div class="saved-indicator" id="saved-indicator">✓ Salvo</div>
      </div>
      <div id="audio-area-container" ${!hasAudio ? 'hidden' : ''}>
        <div id="audio-ui"></div>
      </div>
      <div class="nav-buttons">
        <button class="btn btn--secondary" id="btn-back"${isFirst ? ' style="visibility:hidden"' : ''}>← Voltar</button>
        <button class="btn btn--primary" id="btn-next">${isLast ? 'Revisar' : 'Continuar →'}</button>
      </div>`;
    container.appendChild(screen);

    const modeText = document.getElementById('mode-text');
    const modeAudio = document.getElementById('mode-audio');
    const textCont = document.getElementById('text-area-container');
    const audioCont = document.getElementById('audio-area-container');

    modeText.addEventListener('click', () => {
      modeText.classList.add('active'); modeAudio.classList.remove('active');
      textCont.hidden = false; audioCont.hidden = true;
      document.getElementById('response-input')?.focus();
    });
    modeAudio.addEventListener('click', async () => {
      modeAudio.classList.add('active'); modeText.classList.remove('active');
      textCont.hidden = true; audioCont.hidden = false;
      await setupAudioUI(step.id);
    });

    if (hasAudio) renderAudioPlayback(step.id);

    // Autosave
    const textarea = document.getElementById('response-input');
    const indicator = document.getElementById('saved-indicator');
    let saveTimeout = null;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        Log.start('autosave');
        session.responses[step.id] = textarea.value;
        session.currentStep = index + 1;
        LocalStore.save(slug, session);
        SyncQueue.add(() => saveResponseRemote(step.id, textarea.value, audioRecordings[step.id]?.path));
        SyncQueue.add(() => updateSessionStep(index + 1));
        Log.ok('autosave', { step: step.id, chars: textarea.value.length });
        indicator.classList.add('visible');
        setTimeout(() => indicator.classList.remove('visible'), 1500);
      }, 600);
    });

    if (!hasAudio) textarea.focus();

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
    if (ta) session.responses[stepId] = ta.value;
    session.currentStep = index + 1;
    LocalStore.save(slug, session);
    SyncQueue.add(() => saveResponseRemote(stepId, session.responses[stepId], audioRecordings[stepId]?.path));
    SyncQueue.add(() => updateSessionStep(index + 1));
  }

  // Audio UI
  async function setupAudioUI(stepId) {
    const audioUI = document.getElementById('audio-ui');
    if (audioRecordings[stepId]) { renderAudioPlayback(stepId); return; }
    if (!(await AudioRecorder.checkSupport())) {
      audioUI.innerHTML = `<div class="audio-fallback"><p>Seu navegador não suporta gravação de áudio.</p>
        <button class="btn btn--secondary" id="audio-fb">Responder por texto</button></div>`;
      document.getElementById('audio-fb').addEventListener('click', () => document.getElementById('mode-text').click());
      return;
    }
    audioUI.innerHTML = `<div class="audio-recorder"><button class="audio-record-btn" id="btn-record">
      <span class="audio-record-icon">🎙️</span><span>Toque para gravar</span></button></div>`;
    document.getElementById('btn-record').addEventListener('click', async () => {
      if (!(await AudioRecorder.requestPermission())) {
        audioUI.innerHTML = `<div class="audio-fallback"><p>Não foi possível acessar o microfone.</p>
          <button class="btn btn--secondary" id="audio-fb">Responder por texto</button></div>`;
        document.getElementById('audio-fb').addEventListener('click', () => document.getElementById('mode-text').click());
        return;
      }
      renderRecording(stepId);
    });
  }

  function renderRecording(stepId) {
    const audioUI = document.getElementById('audio-ui');
    audioUI.innerHTML = `<div class="audio-recording"><div class="audio-recording__pulse"></div>
      <div class="audio-recording__timer" id="rec-timer">0:00</div>
      <p class="audio-recording__label">Gravando...</p>
      <button class="audio-stop-btn" id="btn-stop">⏹ Parar gravação</button></div>`;
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
    audioUI.innerHTML = `<div class="audio-preview"><audio controls src="${url}"></audio>
      <p class="audio-preview__info">${sizeMB} MB</p>
      <div class="audio-preview__actions">
        <button class="btn btn--secondary" id="btn-audio-redo">🗑️ Gravar novamente</button>
        <button class="btn btn--primary" id="btn-audio-confirm">✓ Usar esta gravação</button>
      </div></div>`;
    document.getElementById('btn-audio-redo').addEventListener('click', () => {
      URL.revokeObjectURL(url); delete audioRecordings[stepId]; setupAudioUI(stepId);
    });
    document.getElementById('btn-audio-confirm').addEventListener('click', async () => {
      const btn = document.getElementById('btn-audio-confirm');
      btn.disabled = true; btn.textContent = 'Enviando...';
      try {
        const path = await uploadAudioFile(dbSession.id, stepId, blob);
        audioRecordings[stepId] = { blob, path, uploaded: true };
        await saveResponseRemote(stepId, session.responses[stepId], path);
        renderAudioPlayback(stepId);
      } catch (e) {
        console.error('Audio upload error:', e.message);
        btn.disabled = false; btn.textContent = '✓ Usar esta gravação';
        // Remove any previous error before showing the new one
        const prev = audioUI.querySelector('.audio-error');
        if (prev) prev.remove();
        audioUI.insertAdjacentHTML('beforeend',
          `<p class="audio-error">Falha no envio: ${esc(e.message)}</p>`);
      }
    });
  }

  function renderAudioPlayback(stepId) {
    const audioUI = document.getElementById('audio-ui');
    if (!audioUI) return;
    const rec = audioRecordings[stepId];
    if (!rec) return;
    const audioSrc = rec.blob ? URL.createObjectURL(rec.blob) : '';
    audioUI.innerHTML = `<div class="audio-preview audio-preview--confirmed">
      ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : '<p class="audio-preview__info">🎙️ Áudio gravado</p>'}
      <p class="audio-preview__status">✓ Áudio salvo</p>
      <button class="btn btn--secondary" id="btn-audio-replace">Gravar novamente</button></div>`;
    document.getElementById('btn-audio-replace').addEventListener('click', () => {
      delete audioRecordings[stepId]; setupAudioUI(stepId);
    });
  }

  function renderReview() {
    const screen = el('div', 'screen active');
    let cardsHtml = '';
    config.steps.forEach((step, i) => {
      const response = session.responses[step.id] || '';
      const hasAudio = !!audioRecordings[step.id];
      const isEmpty = !response.trim() && !hasAudio;
      let content;
      if (hasAudio && response.trim()) content = `<span>${esc(response)}</span><br><span class="review-card__audio">🎙️ Áudio gravado</span>`;
      else if (hasAudio) content = '<span class="review-card__audio">🎙️ Áudio gravado</span>';
      else if (response.trim()) content = esc(response);
      else content = step.optional ? 'Nenhuma resposta (opcional)' : 'Sem resposta';
      cardsHtml += `<div class="review-card"><div class="review-card__label">${esc(step.title)}</div>
        <div class="review-card__text${isEmpty && !step.optional ? ' review-card__text--empty' : ''}">${content}</div>
        <button class="review-card__edit" data-step="${i}">${esc(config.review.editLabel)}</button></div>`;
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
      </div>`;
    container.appendChild(screen);
    screen.querySelectorAll('.review-card__edit').forEach(btn => {
      btn.addEventListener('click', () => navigate(getStepScreen(parseInt(btn.dataset.step, 10))));
    });
    document.getElementById('btn-back').addEventListener('click', () => navigate(getStepScreen(config.steps.length - 1)));
    document.getElementById('btn-submit').addEventListener('click', async () => {
      const submitBtn = document.getElementById('btn-submit');
      const errorEl = document.getElementById('submit-error');
      submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; errorEl.hidden = true;
      try {
        const ok = await submitRemote();
        if (ok) {
          session.status = 'submitted';
          LocalStore.save(slug, session);
          navigate(SCREEN_CONFIRMATION);
          return;
        }
      } catch (e) {
        console.error('Submit error:', e.message);
        submitBtn.disabled = false; submitBtn.textContent = config.review.submitLabel;
        errorEl.hidden = false;
        errorEl.innerHTML = `<p class="submit-error-text">Falha no envio: ${esc(e.message)}</p>`;
        return;
      }
      submitBtn.disabled = false; submitBtn.textContent = config.review.submitLabel;
      errorEl.hidden = false;
      errorEl.innerHTML = '<p class="submit-error-text">Não foi possível enviar. Verifique sua conexão e tente novamente.</p>';
    });
  }

  function renderConfirmation() {
    const c = config.confirmation;
    const screen = el('div', 'screen active');
    screen.innerHTML = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div class="confirmation-icon">💛</div>
      <h1 class="screen__title" style="text-align:center;">${esc(c.title.replace(' 💛', ''))}</h1>
      <p class="screen__subtitle" style="text-align:center;">${esc(c.message)}</p></div>`;
    container.appendChild(screen);
  }

  function renderNotFound() {
    container.innerHTML = `<div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
      <h1 class="screen__title">Onboarding não encontrado</h1>
      <p class="screen__subtitle">Verifique o link que você recebeu.</p></div>`;
  }

  function renderLoading() {
    container.innerHTML = `<div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
      <p class="screen__subtitle">Carregando...</p></div>`;
  }

  function renderError(msg) {
    container.innerHTML = `<div class="screen active" style="justify-content:center;align-items:center;text-align:center;">
      <h1 class="screen__title">Ops</h1>
      <p class="screen__subtitle">${esc(msg)}</p>
      <button class="btn btn--primary" onclick="location.reload()" style="margin-top:1.5rem;">Tentar novamente</button></div>`;
  }

  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function navigate(screenId) { render(screenId); }

  // ============================================================
  // Init
  // ============================================================
  async function init() {
    slug = getSlugFromURL();
    if (!slug || slug === 'onboarding') { renderNotFound(); return; }
    renderLoading();

    // 1. Load config
    try { config = await loadConfig(slug); }
    catch { renderNotFound(); return; }

    // 2. Authenticate anonymously
    try { await Auth.init(); }
    catch (e) {
      console.error('Auth failed:', e);
      renderError('Não foi possível iniciar. Tente novamente em alguns instantes.');
      return;
    }

    // 3. Resolve client (public read, no auth needed — but we're authenticated now)
    try {
      clientRecord = await db.query('onboarding_clients', {
        filters: `slug=eq.${slug}&select=*`, single: true,
      });
    } catch {}
    if (!clientRecord) { renderNotFound(); return; }

    // 4. Find or create session
    session = await findOrCreateSession(slug, clientRecord.id);
    if (!session) { renderError('Não foi possível criar sua sessão.'); return; }
    LocalStore.save(slug, session);

    // 5. Route
    if (session.status === 'submitted') render(SCREEN_CONFIRMATION);
    else if (session.currentStep > 0 && session.consentAccepted) render(getStepScreen(Math.min(session.currentStep, config.steps.length) - 1));
    else render(SCREEN_WELCOME);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
