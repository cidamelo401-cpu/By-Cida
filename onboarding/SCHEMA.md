# By Cida Smart Onboarding — Database Schema

> MVP usa localStorage. Migrar para Supabase quando configurado.

## Tabelas (Supabase/PostgreSQL)

```sql
-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessões de onboarding
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  onboarding_type TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress', -- in_progress, submitted, analyzed
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  current_step INT DEFAULT 0
);

-- Perguntas (configuração)
CREATE TABLE onboarding_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_type TEXT NOT NULL,
  step INT NOT NULL,
  step_id TEXT NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  helper_text TEXT,
  response_type TEXT DEFAULT 'text', -- text, audio, mixed
  is_optional BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true
);

-- Respostas
CREATE TABLE onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES onboarding_sessions(id),
  question_id UUID REFERENCES onboarding_questions(id),
  step_id TEXT NOT NULL,
  text_response TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Arquivos
CREATE TABLE onboarding_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES onboarding_sessions(id),
  file_type TEXT NOT NULL, -- audio, document, image
  storage_path TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: todas as tabelas devem ter Row Level Security habilitado
-- Respostas e arquivos nunca são publicamente acessíveis
```

## Migração do localStorage

O `OnboardingStore` em `app.js` tem interface substituível:
- `load(slug)` → SELECT da session + responses
- `save(slug, session)` → UPSERT session + responses  
- `createSession(slug, config)` → INSERT session
- `submit(slug)` → UPDATE session.status = 'submitted'

## Preparação para IA (fase futura)

```
client_context (clients + docs existentes)
  + onboarding_responses
  + onboarding_files (transcrições)
  → AI Analysis
  → structured_client_brief {
      facts, decisions, hypotheses,
      contradictions, gaps, opportunities,
      followUpQuestions
    }
```
