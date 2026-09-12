-- ============================================================================
-- LEADS (captura de interesse do catálogo público)
-- ============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  product_id uuid references public.products(id) on delete set null,
  team text not null,
  model text,
  size text,
  sell_price numeric,
  status text not null default 'novo' check (status in ('novo', 'em_negociacao', 'vendido', 'desistiu')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Qualquer visitante do catálogo (anônimo) pode criar um lead
drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon" on public.leads
  for insert to anon, authenticated with check (true);

-- Apenas usuários autenticados (equipe DMS) podem ver e gerenciar leads
drop policy if exists "leads_select_authenticated" on public.leads;
create policy "leads_select_authenticated" on public.leads
  for select to authenticated using (true);

drop policy if exists "leads_update_authenticated" on public.leads;
create policy "leads_update_authenticated" on public.leads
  for update to authenticated using (true) with check (true);

drop policy if exists "leads_delete_admin" on public.leads;
create policy "leads_delete_admin" on public.leads
  for delete to authenticated using (public.is_admin());
